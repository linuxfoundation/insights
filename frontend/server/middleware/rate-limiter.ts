// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { checkRateLimit, setRateLimitHeaders } from '../utils/rate-limiter';
import { RateLimiterConfig } from '~~/server/types/rate-limiter';

/**
 * This is a rate-limiting middleware that checks incoming requests against the configured rate limits and blocks
 * requests that exceed the limits.
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

  // Skip rate limiting if disabled
  if (!rateLimiterConfig.enabled) {
    return;
  }

  try {
    // Check rate limit
    const result = await checkRateLimit(
      event,
      rateLimiterConfig.rules,
      rateLimiterConfig.defaultLimit.maxRequests,
      rateLimiterConfig.defaultLimit.windowSeconds,
    );

    // Set rate limit headers
    setRateLimitHeaders(event, result);

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

    // Log other errors but don't block the request.
    // This ensures the app keeps working even if Redis is down.
    console.error('Rate limiter error:', error);
  }
});
