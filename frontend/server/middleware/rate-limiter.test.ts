// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import type { RedisClientType } from '@redis/client';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import type { RateLimiterConfig } from '~~/server/types/rate-limiter';

const checkRateLimitMock = vi.fn();
const mockSetResponseHeaders = vi.fn();
const mockCreateError = vi.fn((error) => error);

// Mock Nuxt/H3 global functions (auto-imported by Nuxt)
global.defineEventHandler = vi.fn((handler) => handler);
global.useRuntimeConfig = vi.fn();
global.setResponseHeaders = mockSetResponseHeaders;
global.createError = mockCreateError;

vi.mock('../utils/rate-limiter', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

let handleRateLimiting: typeof import('./rate-limiter').handleRateLimiting;

beforeAll(async () => {
  // Import after mocks are set so the module picks up the mocked dependencies.
  ({ handleRateLimiting } = await import('./rate-limiter'));
});

const baseConfig: RateLimiterConfig = {
  enabled: true,
  defaultLimit: { maxRequests: 100, windowSeconds: 60 },
  secret: 'secret',
  redisDatabase: 0,
  rules: [],
  exclusions: [],
};

const mockRedisClient = {} as unknown as RedisClientType;

function createEvent(): H3Event {
  return {
    path: '/api/test',
    method: 'GET',
    node: {
      req: {
        socket: {
          remoteAddress: '127.0.0.1',
        },
      },
    },
  } as unknown as H3Event;
}

describe('handleRateLimiting', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    mockSetResponseHeaders.mockReset();
    mockCreateError.mockReset().mockImplementation((error) => error);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('skips rate limiting when disabled', async () => {
    const config = { ...baseConfig, enabled: false };
    const event = createEvent();

    await handleRateLimiting(event, config, mockRedisClient);

    expect(checkRateLimitMock).not.toHaveBeenCalled();
    expect(mockSetResponseHeaders).not.toHaveBeenCalled();
  });

  it('sets rate limit headers when request is allowed', async () => {
    const config = { ...baseConfig };
    const event = createEvent();
    checkRateLimitMock.mockResolvedValue({
      allowed: true,
      limit: 10,
      remaining: 9,
      resetIn: 30,
      current: 1,
    });

    await handleRateLimiting(event, config, mockRedisClient);

    expect(mockSetResponseHeaders).toHaveBeenCalledWith(event, {
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': '9',
      'X-RateLimit-Reset': '30',
    });
  });

  it('throws a 429 error and sets headers when request is blocked', async () => {
    const config = { ...baseConfig };
    const event = createEvent();
    checkRateLimitMock.mockResolvedValue({
      allowed: false,
      limit: 5,
      remaining: 0,
      resetIn: 42,
      current: 6,
    });
    mockCreateError.mockImplementation((error) => error);

    await expect(handleRateLimiting(event, config, mockRedisClient)).rejects.toMatchObject({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
    });

    expect(mockSetResponseHeaders).toHaveBeenCalledWith(event, {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '42',
    });
  });

  it('rethrows 429 errors originating from checkRateLimit', async () => {
    const config = { ...baseConfig };
    const event = createEvent();
    const rateLimitError = { statusCode: 429, message: 'Too many requests' };
    checkRateLimitMock.mockRejectedValue(rateLimitError);

    await expect(handleRateLimiting(event, config, mockRedisClient)).rejects.toBe(rateLimitError);
  });

  it('logs and continues when a non-429 error occurs', async () => {
    const config = { ...baseConfig };
    const event = createEvent();
    const unexpectedError = new Error('redis unavailable');
    checkRateLimitMock.mockRejectedValue(unexpectedError);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await handleRateLimiting(event, config, mockRedisClient);

    expect(consoleSpy).toHaveBeenCalledWith('Rate limiter error:', unexpectedError);
    expect(mockSetResponseHeaders).not.toHaveBeenCalled();
  });
});
