// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { randomUUID } from 'node:crypto';

import type { FastifyBaseLogger, FastifyRequest } from 'fastify';

import { getRedisClient, type RedisClient } from './clients/redis.js';
import { RateLimitedError } from './lib/errors.js';

// Requests per LFID over a sliding one-second window (ADR-0023).
export const RATE_LIMIT = 30;
const WINDOW_MS = 1000;
// A Redis that keeps the connection open but stops answering would otherwise hold every request.
const CHECK_TIMEOUT_MS = 200;

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Redis did not answer within ${ms} ms`)), ms);
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

// Lets requests through when Redis is down, so a cache outage never takes the API with it.
export function rateLimit(log: FastifyBaseLogger) {
  return async (request: FastifyRequest): Promise<void> => {
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
      count = await withTimeout(
        countRequest(redis, request.username, Date.now()),
        CHECK_TIMEOUT_MS,
      );
    } catch (err: unknown) {
      request.log.error({ err }, 'Rate limit check failed, request allowed');
      return;
    }
    if (count > RATE_LIMIT) {
      throw new RateLimitedError(RATE_LIMIT);
    }
  };
}
