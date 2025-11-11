// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { createHash } from 'crypto';
import type { H3Event } from 'h3';
import type { RedisClientType } from '@redis/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RateLimiterConfig } from '../types/rate-limiter';

const getHeadersMock = vi.fn();

vi.mock('h3', () => ({
  getHeaders: (event: H3Event) => getHeadersMock(event),
}));

// Import after mocks so the module picks up the mocked dependencies.
import { checkRateLimit } from './rate-limiter';

interface RedisMockOptions {
  count: number;
  oldestScore: number | null;
  simulateError?: {
    operation: 'zRemRangeByScore' | 'zAdd' | 'zCount' | 'zRange' | 'zScore' | 'expire';
    error: Error;
  };
}

function createRedisMock({ count, oldestScore, simulateError }: RedisMockOptions) {
  const zRemRangeByScore = vi.fn().mockResolvedValue(undefined);
  const zAdd = vi.fn().mockResolvedValue(undefined);
  const expire = vi.fn().mockResolvedValue(undefined);
  const zCount = vi.fn().mockResolvedValue(count);
  const zRange = vi.fn().mockResolvedValue(count > 0 ? ['oldest-request'] : []);
  const zScore = vi.fn().mockResolvedValue(oldestScore);

  // Apply error simulation if specified
  if (simulateError) {
    const mockFn = {
      zRemRangeByScore,
      zAdd,
      expire,
      zCount,
      zRange,
      zScore,
    }[simulateError.operation];

    if (mockFn) {
      mockFn.mockRejectedValue(simulateError.error);
    }
  }

  return {
    zRemRangeByScore,
    zAdd,
    expire,
    zCount,
    zRange,
    zScore,
  } as unknown as RedisClientType;
}

const baseConfig: RateLimiterConfig = {
  enabled: true,
  defaultLimit: { maxRequests: 5, windowSeconds: 60 },
  secret: 'secret',
  redisDatabase: 0,
  rules: [],
  exclusions: [],
};

function createEvent(overrides: Partial<H3Event> = {}): H3Event {
  return {
    path: '/api/test',
    method: 'GET',
    node: {
      req: {
        socket: { remoteAddress: '127.0.0.1' },
      },
    },
    ...overrides,
  } as H3Event;
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    getHeadersMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('bypasses rate limiting for excluded routes', async () => {
    const config: RateLimiterConfig = {
      ...baseConfig,
      exclusions: [{ route: '/api/community/*' }],
    };
    const event = createEvent({ path: '/api/community/k8s' });
    const redis = createRedisMock({ count: 0, oldestScore: null });
    getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });

    const result = await checkRateLimit(event, config, redis);

    expect(result).toEqual({
      allowed: true,
      limit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      resetIn: 0,
      current: 0,
    });
    expect(redis.zCount).not.toHaveBeenCalled();
  });

  it('applies matching rule limits and allows when within window', async () => {
    const config: RateLimiterConfig = {
      ...baseConfig,
      rules: [{ route: '/api/rule', methods: ['GET'], maxRequests: 3, windowSeconds: 30 }],
    };
    const event = createEvent({ path: '/api/rule', method: 'GET' });
    getHeadersMock.mockReturnValue({ 'x-real-ip': '192.168.1.5' });
    const now = Date.now();
    const windowSeconds = 30;
    const windowMs = windowSeconds * 1000;
    const oldestScore = now - windowMs + 5000; // 5s into the window

    const redis = createRedisMock({ count: 2, oldestScore });

    const result = await checkRateLimit(event, config, redis);

    const hashedIp = createHash('sha256').update(`192.168.1.5:${config.secret}`).digest('hex');
    const expectedKey = `ratelimit:GET:/api/rule:${hashedIp}`;

    expect(redis.zRemRangeByScore).toHaveBeenCalledWith(expectedKey, 0, now - windowMs);
    expect(redis.zAdd).toHaveBeenCalledWith(expectedKey, {
      score: now,
      value: expect.stringMatching(/^\d+-/),
    });
    expect(redis.zCount).toHaveBeenCalledWith(expectedKey, now - windowMs, now);

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(3);
    expect(result.remaining).toBe(1);
    expect(result.current).toBe(2);
    expect(result.resetIn).toBe(Math.ceil((oldestScore + windowMs - now) / 1000));
  });

  it('falls back to default limits and blocks when over the limit', async () => {
    const config: RateLimiterConfig = { ...baseConfig, rules: [] };
    const event = createEvent({ path: '/api/other', method: 'POST' });
    getHeadersMock.mockReturnValue({ 'x-real-ip': '203.0.113.10' });
    const now = Date.now();
    const windowSeconds = config.defaultLimit.windowSeconds;
    const windowMs = windowSeconds * 1000;
    const oldestScore = now - windowMs + 1000; // 1s into the window

    const redis = createRedisMock({ count: 10, oldestScore });

    const result = await checkRateLimit(event, config, redis);

    const hashedIp = createHash('sha256').update(`203.0.113.10:${config.secret}`).digest('hex');
    const expectedKey = `ratelimit:POST:/api/other:${hashedIp}`;

    expect(redis.zCount).toHaveBeenCalledWith(expectedKey, now - windowMs, now);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(config.defaultLimit.maxRequests);
    expect(result.remaining).toBe(0);
    expect(result.current).toBe(10);
    expect(result.resetIn).toBe(Math.ceil((oldestScore + windowMs - now) / 1000));
  });

  describe('IP extraction', () => {
    it('should extract IP from x-forwarded-for header (single IP)', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-forwarded-for': '203.0.113.45' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`203.0.113.45:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should extract first IP from x-forwarded-for header (multiple IPs)', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({
        'x-forwarded-for': '203.0.113.45, 198.51.100.23, 192.0.2.1',
      });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`203.0.113.45:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should handle x-forwarded-for with extra spaces', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-forwarded-for': '  203.0.113.45  ,  198.51.100.23  ' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`203.0.113.45:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should fall back to x-real-ip when x-forwarded-for is not present', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '198.51.100.23' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`198.51.100.23:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should fall back to cf-connecting-ip when x-forwarded-for and x-real-ip are not present', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'cf-connecting-ip': '192.0.2.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`192.0.2.1:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should fall back to x-client-ip when other proxy headers are not present', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-client-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`10.0.0.1:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should strip IPv6 prefix from remoteAddress', async () => {
      const config = { ...baseConfig };
      const event = createEvent({
        path: '/api/test',
        method: 'GET',
        node: {
          req: {
            socket: { remoteAddress: '::ffff:192.168.1.1' },
          },
        },
      } as Partial<H3Event>);
      getHeadersMock.mockReturnValue({});
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`192.168.1.1:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should use remoteAddress as-is if no IPv6 prefix', async () => {
      const config = { ...baseConfig };
      const event = createEvent({
        path: '/api/test',
        method: 'GET',
        node: {
          req: {
            socket: { remoteAddress: '192.168.1.100' },
          },
        },
      } as Partial<H3Event>);
      getHeadersMock.mockReturnValue({});
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`192.168.1.100:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should return unknown when no IP source is available', async () => {
      const config = { ...baseConfig };
      const event = createEvent({
        path: '/api/test',
        method: 'GET',
        node: {
          req: {
            socket: { remoteAddress: undefined },
          },
        },
      } as Partial<H3Event>);
      getHeadersMock.mockReturnValue({});
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`unknown:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should prioritize x-forwarded-for over x-real-ip', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({
        'x-forwarded-for': '203.0.113.45',
        'x-real-ip': '198.51.100.23',
      });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`203.0.113.45:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should prioritize x-real-ip over cf-connecting-ip', async () => {
      const config = { ...baseConfig };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({
        'x-real-ip': '198.51.100.23',
        'cf-connecting-ip': '192.0.2.1',
      });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      await checkRateLimit(event, config, redis);

      const hashedIp = createHash('sha256').update(`198.51.100.23:${config.secret}`).digest('hex');
      const expectedKey = `ratelimit:GET:/api/test:${hashedIp}`;
      expect(redis.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  describe('route matching', () => {
    it('should match exact routes', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test', maxRequests: 10, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(10); // Rule applied, not default (5)
    });

    it('should not match different routes', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/other', maxRequests: 10, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(5); // Default limit, rule didn't match
    });

    it('should match wildcard at end', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/community/*', maxRequests: 15, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/community/k8s', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(15); // Wildcard rule matched
    });

    it('should match wildcard in middle', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/*/users', maxRequests: 20, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/v1/users', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(20); // Wildcard in middle matched
    });

    it('should match multiple wildcards', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/*/community/*/data', maxRequests: 25, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/v1/community/k8s/data', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(25); // Multiple wildcards matched
    });

    it('should not match when wildcard pattern fails', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/community/*', maxRequests: 10, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(5); // Pattern didn't match, default used
    });

    it('should handle special regex characters in route (dots)', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test.json', maxRequests: 10, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test.json', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(10); // Dot handled correctly
    });

    it('should handle special regex characters (question mark, plus)', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test?id=1+2', maxRequests: 10, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test?id=1+2', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(10); // Question mark and plus handled
    });

    it('should handle special regex characters (parentheses, brackets)', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test[0]', maxRequests: 10, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test[0]', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(10); // Brackets handled correctly
    });

    it('should match root wildcard', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/*', maxRequests: 30, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/anything/here', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(30); // Root wildcard matched
    });
  });

  describe('rule matching', () => {
    it('should return default limit when no rules match', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/other', maxRequests: 10, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(5); // Default limit (no rule matched)
    });

    it('should return matching rule for exact path', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test', maxRequests: 12, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(12); // Exact match rule applied
    });

    it('should return matching rule with wildcard', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/community/*', maxRequests: 18, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/community/k8s', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(18); // Wildcard rule matched
    });

    it('should return first matching rule when multiple rules match', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [
          { route: '/api/*', maxRequests: 10, windowSeconds: 30 },
          { route: '/api/community/*', maxRequests: 20, windowSeconds: 60 },
        ],
      };
      const event = createEvent({ path: '/api/community/k8s', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(10); // First rule wins (priority order)
      expect(result.resetIn).toBeLessThanOrEqual(30); // Uses first rule's window
    });

    it('should match rule with method filter (matching method)', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [
          { route: '/api/test', methods: ['GET', 'POST'], maxRequests: 15, windowSeconds: 60 },
        ],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(15); // Method matches, rule applied
    });

    it('should not match rule with method filter (non-matching method)', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test', methods: ['GET'], maxRequests: 15, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'POST' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(5); // Method doesn't match, default used
    });

    it('should match rule without method filter for any method', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test', maxRequests: 22, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'DELETE' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(22); // No method filter, matches any method
    });

    it('should handle case-insensitive method matching', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        rules: [{ route: '/api/test', methods: ['GET'], maxRequests: 28, windowSeconds: 60 }],
      };
      const event = createEvent({ path: '/api/test', method: 'get' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(28); // Method normalized to uppercase
    });
  });

  describe('exclusions', () => {
    it('should not bypass when exclusions array is empty', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(5); // No bypass, normal rate limiting
      expect(redis.zCount).toHaveBeenCalled(); // Redis operations performed
    });

    it('should bypass for exact route exclusion', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [{ route: '/api/health' }],
      };
      const event = createEvent({ path: '/api/health', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(Number.MAX_SAFE_INTEGER);
      expect(redis.zCount).not.toHaveBeenCalled(); // No Redis calls
    });

    it('should bypass for wildcard exclusion pattern', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [{ route: '/api/public/*' }],
      };
      const event = createEvent({ path: '/api/public/docs', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(Number.MAX_SAFE_INTEGER);
      expect(redis.zCount).not.toHaveBeenCalled();
    });

    it('should not bypass for non-matching route', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [{ route: '/api/health' }],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(5); // Normal rate limiting
      expect(redis.zCount).toHaveBeenCalled();
    });

    it('should bypass for method-specific exclusion (matching method)', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [{ route: '/api/test', methods: ['GET'] }],
      };
      const event = createEvent({ path: '/api/test', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(Number.MAX_SAFE_INTEGER);
      expect(redis.zCount).not.toHaveBeenCalled();
    });

    it('should not bypass for method-specific exclusion (non-matching method)', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [{ route: '/api/test', methods: ['GET'] }],
      };
      const event = createEvent({ path: '/api/test', method: 'POST' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.limit).toBe(5); // Method doesn't match, normal limiting
      expect(redis.zCount).toHaveBeenCalled();
    });

    it('should check multiple exclusions in order', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [{ route: '/api/health' }, { route: '/api/public/*' }],
      };
      const event = createEvent({ path: '/api/public/docs', method: 'GET' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(Number.MAX_SAFE_INTEGER); // Second exclusion matched
      expect(redis.zCount).not.toHaveBeenCalled();
    });

    it('should exclude all methods when method filter not specified', async () => {
      const config: RateLimiterConfig = {
        ...baseConfig,
        exclusions: [{ route: '/api/health' }], // No methods specified
      };
      const event = createEvent({ path: '/api/health', method: 'DELETE' });
      getHeadersMock.mockReturnValue({ 'x-real-ip': '10.0.0.1' });
      const redis = createRedisMock({ count: 1, oldestScore: Date.now() });

      const result = await checkRateLimit(event, config, redis);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(Number.MAX_SAFE_INTEGER); // Any method excluded
      expect(redis.zCount).not.toHaveBeenCalled();
    });
  });
});
