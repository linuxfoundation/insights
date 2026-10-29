// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../src/app.js';
import { USERNAME_CLAIM } from '../src/auth.js';
import { RATE_LIMITS } from '../src/rate-limit.js';
import { audience, issuer, localKeys, sign, useAuthApp, whoami } from './helpers/auth.js';
import { atDate } from './helpers/tinybird.js';

interface ClientOptions {
  url: string;
  socket: { reconnectStrategy: (retries: number) => number };
}

// An in-memory stand-in for the sorted-set commands the limiter sends: one MULTI per request, plus
// a ZREM for a rejected one.
const redis = vi.hoisted(() => {
  const sets = new Map<string, { score: number; value: string }[]>();
  const state = {
    ready: true,
    failExec: false,
    failRem: false,
    hang: false,
    multis: 0,
    destroyed: 0,
    clients: [] as ClientOptions[],
    listeners: new Map<string, (err: unknown) => void>(),
  };
  const client = {
    get isReady() {
      return state.ready;
    },
    isOpen: true,
    on(event: string, listener: (err: unknown) => void) {
      state.listeners.set(event, listener);
      return client;
    },
    connect: async () => client,
    destroy: () => {
      state.destroyed += 1;
    },
    async zRem(key: string, value: string) {
      if (state.failRem) {
        throw new Error('READONLY You cannot write against a read only replica.');
      }
      const kept = (sets.get(key) ?? []).filter((member) => member.value !== value);
      const removed = (sets.get(key)?.length ?? 0) - kept.length;
      sets.set(key, kept);
      return removed;
    },
    multi() {
      state.multis += 1;
      const ops: (() => number)[] = [];
      const members = (key: string) => sets.get(key) ?? [];
      const chain = {
        zRemRangeByScore(key: string, min: number, max: number) {
          ops.push(() => {
            const kept = members(key).filter(({ score }) => score < min || score > max);
            const removed = members(key).length - kept.length;
            sets.set(key, kept);
            return removed;
          });
          return chain;
        },
        zAdd(key: string, member: { score: number; value: string }) {
          ops.push(() => {
            sets.set(key, [...members(key), member]);
            return 1;
          });
          return chain;
        },
        zCard(key: string) {
          ops.push(() => members(key).length);
          return chain;
        },
        pExpire(_key: string, _ms: number) {
          ops.push(() => 1);
          return chain;
        },
        async exec() {
          if (state.hang) {
            return new Promise<never>(() => {});
          }
          if (state.failExec) {
            throw new Error('READONLY You cannot write against a read only replica.');
          }
          return ops.map((op) => op());
        },
      };
      return chain;
    },
  };
  return { sets, state, client };
});

vi.mock('@redis/client', () => ({
  createClient: (options: ClientOptions) => {
    redis.state.clients.push(options);
    return redis.client;
  },
}));

const redisUrl = 'redis://cache.test:6379/2';
// The real clock, so the 5-minute test tokens stay valid at every faked time below.
const start = Date.now();
const later = (ms: number) => new Date(start + ms).toISOString();
const t0 = later(0);

const tooManyRequestsBody = {
  statusCode: 429,
  code: 'rate_limit_exceeded',
  error: 'Too Many Requests',
  message: 'Rate limit of 30 requests per second exceeded',
};

beforeEach(() => {
  redis.sets.clear();
  Object.assign(redis.state, {
    ready: true,
    failExec: false,
    failRem: false,
    hang: false,
    multis: 0,
  });
});

describe('rate limiting', () => {
  const get = useAuthApp({ versions: whoami, authKeys: localKeys }, { API_REDIS_URL: redisUrl });
  let jdoe: string;
  let asmith: string;

  beforeEach(async () => {
    jdoe = `Bearer ${await sign()}`;
    asmith = `Bearer ${await sign({ claims: { [USERNAME_CLAIM]: 'asmith' } })}`;
  });

  const statuses = async (
    count: number,
    authorization: string,
    headers?: Record<string, string>,
  ) => {
    const result: number[] = [];
    for (let i = 0; i < count; i += 1) {
      result.push((await get('/v1-alpha/whoami', authorization, headers)).statusCode);
    }
    return result;
  };

  it('allows 30 requests a second and answers 429 to the next', async () => {
    await atDate(t0, async () => {
      expect(await statuses(30, jdoe)).toEqual(Array(30).fill(200));

      const response = await get('/v1-alpha/whoami', jdoe);

      expect(response.statusCode).toBe(429);
      expect(response.json()).toEqual(tooManyRequestsBody);
    });
    expect(redis.state.clients.map(({ url }) => url)).toEqual([redisUrl]);
    expect([...redis.sets.keys()]).toEqual(['insights-api:ratelimit:jdoe']);
  });

  it('counts each rejection by tier and endpoint', async () => {
    const increment = vi.spyOn(tracer.dogstatsd, 'increment');
    await atDate(t0, async () => {
      await statuses(31, jdoe);
    });

    expect(
      increment.mock.calls.filter(([name]) => name === 'insights.api.ratelimit.rejections'),
    ).toEqual([
      ['insights.api.ratelimit.rejections', 1, { tier: 'basic', endpoint: '/v1-alpha/whoami' }],
    ]);
    increment.mockRestore();
  });

  it('gives a caller the Worker sends a tier for the premium limit', async () => {
    const { premium } = RATE_LIMITS;
    // Both tiers start at 30, so premium is raised here to tell them apart.
    RATE_LIMITS.premium = 35;
    try {
      await atDate(t0, async () => {
        const gold = { 'x-tier': 'gold' };
        expect(await statuses(35, jdoe, gold)).toEqual(Array(35).fill(200));

        const limited = await get('/v1-alpha/whoami', jdoe, gold);

        expect(limited.statusCode).toBe(429);
        expect(limited.headers['x-ratelimit-limit']).toBe('35');
        expect(limited.json()).toMatchObject({
          message: 'Rate limit of 35 requests per second exceeded',
        });
        expect(await statuses(31, asmith)).toEqual([...Array(30).fill(200), 429]);
      });
    } finally {
      RATE_LIMITS.premium = premium;
    }
  });

  it('reports the limit, the requests left and the reset on every response', async () => {
    const rateHeaders = (response: Awaited<ReturnType<typeof get>>) => ({
      limit: response.headers['x-ratelimit-limit'],
      remaining: response.headers['x-ratelimit-remaining'],
      reset: response.headers['x-ratelimit-reset'],
      retryAfter: response.headers['retry-after'],
    });

    await atDate(t0, async () => {
      expect(rateHeaders(await get('/v1-alpha/whoami', jdoe))).toEqual({
        limit: '30',
        remaining: '29',
        reset: '1',
        retryAfter: undefined,
      });
      await statuses(29, jdoe);

      const limited = await get('/v1-alpha/whoami', jdoe);

      expect(limited.statusCode).toBe(429);
      expect(rateHeaders(limited)).toEqual({
        limit: '30',
        remaining: '0',
        reset: '1',
        retryAfter: '1',
      });
    });
  });

  it('sends no rate limit headers when it lets a request through unchecked', async () => {
    redis.state.ready = false;

    const response = await get('/v1-alpha/whoami', jdoe);

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-ratelimit-limit']).toBeUndefined();
  });

  it('frees requests as the window slides past them', async () => {
    await atDate(t0, () => statuses(30, jdoe));

    expect(await atDate(later(999), () => statuses(1, jdoe))).toEqual([429]);
    expect(await atDate(later(1000), () => statuses(1, jdoe))).toEqual([200]);
  });

  it('takes rejected requests back out of the window, so they cost no later request', async () => {
    const { basic } = RATE_LIMITS;
    await atDate(t0, () => statuses(basic, jdoe));

    expect(await atDate(later(500), () => statuses(basic, jdoe))).toEqual(Array(basic).fill(429));
    expect(await atDate(later(1000), () => statuses(basic, jdoe))).toEqual(Array(basic).fill(200));
  });

  it('still answers 429 when taking a rejected request back out fails', async () => {
    await atDate(t0, () => statuses(RATE_LIMITS.basic, jdoe));
    redis.state.failRem = true;

    const response = await atDate(t0, () => get('/v1-alpha/whoami', jdoe));

    expect(response.statusCode).toBe(429);
    expect(response.headers['retry-after']).toBe('1');
  });

  it('keeps a separate count per LFID', async () => {
    await atDate(t0, async () => {
      await statuses(31, jdoe);

      expect(await statuses(1, asmith)).toEqual([200]);
    });
  });

  it('lets requests through without asking Redis while it is not ready', async () => {
    redis.state.ready = false;

    await atDate(t0, async () => {
      expect(await statuses(31, jdoe)).toEqual(Array(31).fill(200));
    });
    expect(redis.state.multis).toBe(0);
  });

  it('lets requests through when the check fails', async () => {
    redis.state.failExec = true;

    expect(await statuses(31, jdoe)).toEqual(Array(31).fill(200));
    expect(redis.state.multis).toBe(31);
  });

  it('lets a request through when Redis does not answer in time', async () => {
    redis.state.hang = true;

    expect(await statuses(1, jdoe)).toEqual([200]);
    expect(redis.state.multis).toBe(1);
  });

  it('drops a connection that stops answering, so unanswered checks cannot pile up', async () => {
    await statuses(1, jdoe);
    const clients = redis.state.clients.length;
    const { destroyed } = redis.state;
    redis.state.hang = true;

    expect(await statuses(3, jdoe)).toEqual([200, 200, 200]);
    expect(redis.state.destroyed).toBe(destroyed + 3);
    expect(redis.state.clients).toHaveLength(clients + 2);
  });

  it('skips the limit while auth is disabled', async () => {
    vi.stubEnv('API_AUTH_DISABLED', 'true');

    expect(await statuses(31, jdoe)).toEqual(Array(31).fill(200));
    expect(redis.state.multis).toBe(0);
  });

  it('leaves the spec route out of the limit', async () => {
    await atDate(t0, () => statuses(30, jdoe));

    expect((await get('/v1-alpha/openapi.json', jdoe)).statusCode).toBe(200);
    expect(redis.state.multis).toBe(30);
  });

  it('reconnects with a backoff capped at 3 seconds and logs client errors', async () => {
    await statuses(1, jdoe);
    const { reconnectStrategy } = redis.state.clients[0]!.socket;

    expect(reconnectStrategy(1)).toBe(50);
    expect(reconnectStrategy(1000)).toBe(3000);
    expect(() => redis.state.listeners.get('error')?.(new Error('ECONNREFUSED'))).not.toThrow();
    expect(redis.state.listeners.has('error')).toBe(true);
  });
});

describe('without API_REDIS_URL', () => {
  const get = useAuthApp({ versions: whoami, authKeys: localKeys });

  it('lets requests through without creating a client', async () => {
    const clients = redis.state.clients.length;
    const jdoe = `Bearer ${await sign()}`;

    for (let i = 0; i < 31; i += 1) {
      expect((await get('/v1-alpha/whoami', jdoe)).statusCode).toBe(200);
    }
    expect(redis.state.clients).toHaveLength(clients);
  });
});

describe('the Redis client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is destroyed when the app closes', async () => {
    vi.stubEnv('API_AUTH_DISABLED', '');
    vi.stubEnv('API_AUTH0_ISSUER_URL', issuer);
    vi.stubEnv('API_AUTH0_AUDIENCE', audience);
    vi.stubEnv('API_REDIS_URL', redisUrl);
    const app = await buildApp({ versions: whoami, authKeys: localKeys });
    await app.inject({
      method: 'GET',
      url: '/v1-alpha/whoami',
      headers: { authorization: `Bearer ${await sign()}` },
    });
    const destroyed = redis.state.destroyed;

    await app.close();

    expect(redis.state.destroyed).toBe(destroyed + 1);
  });
});
