// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { randomUUID } from 'node:crypto';

import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { dropRedisClient, getRedisClient, type RedisClient } from './clients/redis.js';
import { RateLimitedError } from './lib/errors.js';
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

// The timed-out work keeps running, so onTimeout is where the caller abandons it.
async function withTimeout<T>(work: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Redis did not answer within ${ms} ms`));
      onTimeout();
    }, ms);
  });
  try {
    return await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

// Records this request, rejected or not, and returns the caller's count over the last window.
async function countRequest(redis: RedisClient, username: string, now: number): Promise<number> {
  const key = `insights-api:ratelimit:${username}`;
  const [, , count] = await redis
    .multi()
    .zRemRangeByScore(key, 0, now - WINDOW_MS)
    .zAdd(key, { score: now, value: `${now}-${randomUUID()}` })
    .zCard(key)
    .pExpire(key, WINDOW_MS)
    .exec();
  return Number(count);
}

// Lets requests through when Redis is down, so a cache outage never takes the API with it. Such
// requests carry no X-RateLimit-* headers, since there is no count to report.
export function rateLimit(log: FastifyBaseLogger) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // null only while auth is disabled for local development.
    if (request.username === null) {
      return;
    }
    let count: number;
    try {
      const redis = getRedisClient(log);
      // A MULTI on a reconnecting client waits for Redis to return; the client logs the outage.
      if (!redis.isReady) {
        return;
      }
      // A connection that stops answering would collect one unanswered MULTI per request, so it is
      // dropped and the next request reconnects.
      count = await withTimeout(
        countRequest(redis, request.username, Date.now()),
        CHECK_TIMEOUT_MS,
        () => dropRedisClient(redis),
      );
    } catch (err: unknown) {
      request.log.error({ err }, 'Rate limit check failed, request allowed');
      return;
    }
    const limit = RATE_LIMITS[tierOf(request)];
    reply.headers({
      'x-ratelimit-limit': limit,
      'x-ratelimit-remaining': Math.max(0, limit - count),
      'x-ratelimit-reset': RESET_SECONDS,
    });
    if (count > limit) {
      reply.header('retry-after', RESET_SECONDS);
      throw new RateLimitedError(limit);
    }
  };
}
