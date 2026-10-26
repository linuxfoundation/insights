// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import type { RouteOptions } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  cacheKey,
  cacheResponses,
  cacheTtl,
  LONG_TTL_SECONDS,
  SHORT_TTL_SECONDS,
} from '../src/response-cache.js';
import { localKeys, sign, useAuthApp } from './helpers/auth.js';
import { mockFetch, tinybirdError, tinybirdHost, tinybirdStub } from './helpers/tinybird.js';

// An in-memory stand-in for the commands the cache sends, plus the MULTI the rate limiter sends.
const redis = vi.hoisted(() => {
  const entries = new Map<string, string>();
  const state = { ready: true, failGet: false };
  const sets: { key: string; options: unknown }[] = [];
  const client = {
    get isReady() {
      return state.ready;
    },
    isOpen: true,
    on: () => client,
    connect: async () => client,
    destroy: () => {},
    get: vi.fn(async (key: string) => {
      if (state.failGet) {
        throw new Error('LOADING Redis is loading the dataset in memory');
      }
      return entries.get(key) ?? null;
    }),
    async set(key: string, value: string, options: unknown) {
      sets.push({ key, options });
      entries.set(key, value);
      return 'OK';
    },
    multi() {
      const chain = {
        zRemRangeByScore: () => chain,
        zAdd: () => chain,
        zCard: () => chain,
        pExpire: () => chain,
        exec: async () => [0, 1, 1, 1],
      };
      return chain;
    },
  };
  return { entries, state, sets, client };
});

vi.mock('@redis/client', () => ({ createClient: () => redis.client }));

const increment = vi.spyOn(tracer.dogstatsd, 'increment');

const organizationRoute = '/v1-alpha/organizations/microsoft';
const premium = { 'x-tier': 'gold' };
const microsoftRow = {
  id: '0f7c5c1e-0000-4000-8000-000000000001',
  displayName: 'Microsoft',
  logo: '',
  employeeCount: '',
  industry: '',
  description: '',
  website: '',
  domain: '',
  membership: 'Platinum',
};

const lookups = () =>
  increment.mock.calls
    .filter(([name]) => name === 'insights.api.cache.lookups')
    .map(([, , tags]) => (tags as { result: string }).result);

describe('route TTLs', () => {
  it('keeps the frontend tiers: a day for reference data, an hour for metrics', () => {
    for (const route of [
      '/v1-alpha/categories',
      '/v1-alpha/leaderboards',
      '/v1-alpha/leaderboards/:type',
      '/v1-alpha/oss-index/collections',
    ]) {
      expect(cacheTtl(route), route).toBe(LONG_TTL_SECONDS);
    }
    for (const route of [
      '/v1-alpha/projects/:slug',
      '/v1-alpha/projects/:slug/development/pull-requests',
      '/v1-alpha/organizations/:slug/metrics',
      '/v1-alpha/projects/:slug/security/vulnerabilities',
    ]) {
      expect(cacheTtl(route), route).toBe(SHORT_TTL_SECONDS);
    }
  });

  it('leaves collections uncached, as on the frontend', () => {
    for (const route of [
      '/v1-alpha/collections',
      '/v1-alpha/collections/:slug/metrics',
      '/v1-alpha/projects/:slug/collections',
      '/v1-alpha/repositories/collections',
    ]) {
      expect(cacheTtl(route), route).toBeUndefined();
    }
  });
});

describe('cached routes', () => {
  it('leaves a route without a schema uncached, since nothing says which inputs shape it', () => {
    const handler = async () => ({});
    const route = { method: 'GET', url: '/v1-alpha/whoami', handler } as unknown as RouteOptions;

    cacheResponses(console as never)(route);

    expect(route.handler).toBe(handler);
  });
});

describe('cache keys', () => {
  const route = '/v1-alpha/projects/:slug/popularity/stars';
  const declared = ['startDate', 'repos'];

  it('ignores query params the route does not declare and the order of the rest', () => {
    const plain = cacheKey(
      route,
      { slug: 'k8s' },
      { startDate: '2026-01-01', repos: ['a'] },
      declared,
    );

    expect(
      cacheKey(
        route,
        { slug: 'k8s' },
        { repos: ['a'], startDate: '2026-01-01', junk: 'x' },
        declared,
      ),
    ).toBe(plain);
    expect(
      cacheKey(route, { slug: 'k8s' }, { startDate: '2026-02-01', repos: ['a'] }, declared),
    ).not.toBe(plain);
    expect(
      cacheKey(route, { slug: 'envoy' }, { startDate: '2026-01-01', repos: ['a'] }, declared),
    ).not.toBe(plain);
  });

  it('starts every build on fresh keys', () => {
    vi.stubEnv('API_BUILD_SHA', 'abc123');
    const first = cacheKey(route, { slug: 'k8s' }, {}, declared);
    vi.stubEnv('API_BUILD_SHA', 'def456');

    expect(cacheKey(route, { slug: 'k8s' }, {}, declared)).not.toBe(first);
    expect(first).toMatch(
      /^insights-api:cache:abc123:\/v1-alpha\/projects\/:slug\/popularity\/stars:/,
    );
    vi.unstubAllEnvs();
  });
});

describe('response cache', () => {
  const get = useAuthApp(
    { authKeys: localKeys },
    {
      API_REDIS_URL: 'redis://cache.test:6379/0',
      API_TB_HOST: tinybirdHost,
      API_TB_TOKEN: 'test-token',
    },
  );
  let token: string;

  beforeEach(async () => {
    redis.entries.clear();
    redis.sets.length = 0;
    Object.assign(redis.state, { ready: true, failGet: false });
    redis.client.get.mockClear();
    increment.mockClear();
    token = `Bearer ${await sign()}`;
    mockFetch.mockImplementation(tinybirdStub(() => [microsoftRow]));
  });

  it('answers a repeated request from Redis without calling Tinybird again', async () => {
    const first = await get(organizationRoute, token, premium);
    const tinybirdCalls = mockFetch.mock.calls.length;
    const second = await get(organizationRoute, token, premium);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(second.body).toBe(first.body);
    expect(second.headers['content-type']).toBe(first.headers['content-type']);
    expect(second.headers['cache-control']).toBe('private, max-age=0');
    expect(mockFetch.mock.calls.length).toBe(tinybirdCalls);
    expect(redis.sets.map(({ options }) => options)).toEqual([
      { expiration: { type: 'EX', value: SHORT_TTL_SECONDS } },
    ]);
    expect(lookups()).toEqual(['miss', 'hit']);
  });

  it('shares one entry across unknown query params', async () => {
    await get(organizationRoute, token, premium);
    const tinybirdCalls = mockFetch.mock.calls.length;

    expect((await get(`${organizationRoute}?utm_source=x`, token, premium)).statusCode).toBe(200);
    expect(mockFetch.mock.calls.length).toBe(tinybirdCalls);
  });

  it('keeps the tier check ahead of the cache', async () => {
    await get(organizationRoute, token, premium);

    const basic = await get(organizationRoute, token);

    expect(basic.statusCode).toBe(403);
    expect(basic.json()).toMatchObject({ code: 'tier_forbidden' });
  });

  it('caches reference data for a day', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => []));

    expect((await get('/v1-alpha/categories', token)).statusCode).toBe(200);
    expect(redis.sets.map(({ options }) => options)).toEqual([
      { expiration: { type: 'EX', value: LONG_TTL_SECONDS } },
    ]);
  });

  it('never caches a failed request', async () => {
    mockFetch.mockImplementation(async () => tinybirdError(500));

    expect((await get(organizationRoute, token, premium)).statusCode).toBe(503);
    expect(redis.sets).toEqual([]);

    mockFetch.mockImplementation(tinybirdStub(() => [microsoftRow]));
    expect((await get(organizationRoute, token, premium)).statusCode).toBe(200);
  });

  it('serves from Tinybird while Redis is not ready', async () => {
    redis.state.ready = false;

    expect((await get(organizationRoute, token, premium)).statusCode).toBe(200);
    expect(redis.client.get).not.toHaveBeenCalled();
    expect(lookups()).toEqual(['bypass']);
  });

  it('serves from Tinybird when the cache read fails', async () => {
    redis.state.failGet = true;

    expect((await get(organizationRoute, token, premium)).statusCode).toBe(200);
    expect(redis.sets).toEqual([]);
    expect(lookups()).toEqual(['bypass']);
  });
});
