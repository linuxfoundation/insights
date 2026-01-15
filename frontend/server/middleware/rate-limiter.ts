// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { RedisClientType } from '@redis/client';
import { checkRateLimit } from '../utils/rate-limiter';
import { getRedisClient } from '../utils/redis-client';
import { RateLimiterConfig } from '~~/server/types/rate-limiter';

/**
 * This is a rate-limiting middleware that checks incoming requests against the configured rate
 * limits and blocks requests that exceed the limits. The defineEventHandler entrypoint is simple
 * and delegates the actual logic to the handleRateLimiting function for easier testing, allowing
 * injection of mocked dependencies and configuration.
 *
 * Features:
 * - Uses Redis for distributed rate limiting
 * - Hashes IP addresses for GDPR compliance
 * - Supports per-route and per-method limits
 * - Adds rate limit headers to responses
 */
export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const rateLimiterConfig = config.rateLimiter as RateLimiterConfig;

  // Skip rate limiting if Redis URL is not configured
  if (!config.redisUrl) {
    return;
  }

  // getRedisClient memoizes the client instance, so it's not a problem to call it multiple times.
  const redisClient = await getRedisClient(config.redisUrl, rateLimiterConfig.redisDatabase, true);

  await handleRateLimiting(event, rateLimiterConfig, redisClient);
});

/**
 * Handles rate limiting for the given event and rate limiter configuration.
 *
 * @param event - The H3 event object for the incoming request.
 * @param rateLimiterConfig - The rate limiter configuration to use.
 * @param redisClient - The Redis client instance to use for rate limiting.
 */
export async function handleRateLimiting(
  event: H3Event,
  rateLimiterConfig: RateLimiterConfig,
  redisClient: RedisClientType,
) {
  // Skip rate limiting if disabled
  if (!rateLimiterConfig.enabled) {
    return;
  }

  try {
    const result = await checkRateLimit(event, rateLimiterConfig, redisClient);

    setResponseHeaders(event, {
      ['X-RateLimit-Limit']: result.limit.toString(),
      ['X-RateLimit-Remaining']: result.remaining.toString(),
      ['X-RateLimit-Reset']: result.resetIn.toString(),
    });

    // Block request if rate limit exceeded
    if (!result.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        message: `Rate limit exceeded. Please wait ${result.resetIn} seconds before trying again.`,
      });
    }
  } catch (error) {
    // If it's already a 429 error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 429) {
      throw error;
    }

    // Log other errors but don't block the request. This way the app keeps working even if Redis
    // is down or the rate limiter fails for some other reason.
    console.error('Rate limiter error:', error);
  }
}
