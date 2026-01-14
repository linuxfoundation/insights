// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { RateLimiterConfig } from '../server/types/rate-limiter';

/**
 * Rate limiter configuration
 *
 * Configuration for rate limiting rules here.
 * Rules are evaluated in order; the first matching rule wins.
 */
const rateLimiterConfig: RateLimiterConfig = {
  // Enable or disable the rate limiter globally
  enabled: true,

  // Default rate limit for routes not matching any specific rule
  defaultLimit: {
    maxRequests: parseInt(process.env.NUXT_RATE_LIMITER_MAX_REQUESTS || '200'),
    windowSeconds: parseInt(process.env.NUXT_RATE_LIMITER_WINDOW_SECONDS || '60'),
  },

  // Secret used for hashing IPs for GDPR compliance
  secret: process.env.NUXT_RATE_LIMITER_SECRET || 'this is a random secret string for hashing ips',

  // Redis database number to use for rate limiting
  redisDatabase: parseInt(process.env.NUXT_RATE_LIMITER_REDIS_DB || '1', 10),

  // Route-specific rules
  rules: [
    {
      route: '/api/auth/*',
      methods: ['POST'],
      maxRequests: 5,
      windowSeconds: 60, // 5 login attempts per minute
    },
    {
      route: '/api/report',
      methods: ['POST'],
      maxRequests: 10,
      windowSeconds: 60, // 10 reports per minute
    },
  ],

  // Routes to exclude from rate limiting
  exclusions: [
    {
      route: '/api/community/*',
    },
    {
      route: '/api/badge/*',
      methods: ['GET'],
    },
  ],
};

export default rateLimiterConfig;
