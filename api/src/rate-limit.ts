// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { randomUUID } from 'node:crypto';

import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { dropRedisClient, getRedisClient, withTimeout, type RedisClient } from './clients/redis.js';
import { RateLimitedError } from './lib/errors.js';
import { count as countMetric } from './metrics.js';
import { tierOf, type Tier } from './tier.js';

// Requests per LFID over a sliding one-second window, by tier (ADR-0023). Both stay at 30 until load
// tests set them.
export const RATE_LIMITS: Record<Tier, number> = { basic: 30, premium: 30 };
const WINDOW_MS = 1000;
// The oldest request in a one-second window always leaves it within a second, so reset and
// Retry-After are both one second.
const RESET_SECONDS = Math.ceil(WINDOW_MS / 1000);
// A Redis that keeps the connection open but stops answering would otherwise hold every request.
const CHECK_TIMEOUT_MS = 200;

// Records this request and returns the caller's count over the last window, this request included.
async function countRequest(
  redis: RedisClient,
  key: string,
  member: string,
  now: number,
): Promise<number> {
  const [, , count] = await redis
    .multi()
    .zRemRangeByScore(key, 0, now - WINDOW_MS)
    .zAdd(key, { score: now, value: member })
    .zCard(key)
    .pExpire(key, WINDOW_MS)
    .exec();
  return Number(count);
}

// Takes a rejected request back out of the window, so a caller over the limit loses only the
// requests past it. A failed removal costs the caller that one slot until the window slides on.
async function release(
  request: FastifyRequest,
  redis: RedisClient,
  key: string,
  member: string,
): Promise<void> {
  try {
    await withTimeout(redis.zRem(key, member), CHECK_TIMEOUT_MS, () => dropRedisClient(redis));
  } catch (err: unknown) {
    request.log.warn({ err }, 'Rate limit release failed');
  }
}

// Lets requests through when Redis is down, so a cache outage never takes the API with it. Such
// requests carry no X-RateLimit-* headers, since there is no count to report.
export function rateLimit(log: FastifyBaseLogger) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // null only while auth is disabled for local development.
    if (request.username === null) {
      return;
    }
    const key = `insights-api:ratelimit:${request.username}`;
    const now = Date.now();
    const member = `${now}-${randomUUID()}`;
    let redis: RedisClient;
    let count: number;
    try {
      redis = getRedisClient(log);
      // A MULTI on a reconnecting client waits for Redis to return; the client logs the outage.
      if (!redis.isReady) {
        return;
      }
      // A connection that stops answering would collect one unanswered MULTI per request, so it is
      // dropped and the next request reconnects.
      count = await withTimeout(countRequest(redis, key, member, now), CHECK_TIMEOUT_MS, () =>
        dropRedisClient(redis),
      );
    } catch (err: unknown) {
      request.log.error({ err }, 'Rate limit check failed, request allowed');
      return;
    }
    const tier = tierOf(request);
    const limit = RATE_LIMITS[tier];
    reply.headers({
      'x-ratelimit-limit': limit,
      'x-ratelimit-remaining': Math.max(0, limit - count),
      'x-ratelimit-reset': RESET_SECONDS,
    });
    if (count > limit) {
      await release(request, redis, key, member);
      countMetric('ratelimit.rejections', {
        tier,
        endpoint: request.routeOptions.url ?? 'unmatched',
      });
      reply.header('retry-after', RESET_SECONDS);
      throw new RateLimitedError(limit);
    }
  };
}
