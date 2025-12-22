// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * HTTP methods supported by the rate limiter.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Rate limit configuration for a specific route.
 */
export interface RateLimitRule {
  /**
   * The route pattern to match (supports wildcards).
   * Examples: '/api/*', '/api/report', '/api/auth/*'
   */
  route: string;

  /**
   * HTTP methods this rule applies to. If not specified, it applies to all methods.
   */
  methods?: HttpMethod[];

  /**
   * Maximum number of requests allowed within the window.
   */
  maxRequests: number;

  /**
   * Time window in seconds.
   */
  windowSeconds: number;
}

/**
 * Exclusion rule for routes that should bypass rate limiting.
 */
export interface RateLimitExclusion {
  /**
   * The route pattern to exclude (supports wildcards).
   * Examples: '/api/health', '/api/public/*', '/_nuxt/*'
   */
  route: string;

  /**
   * HTTP methods this exclusion applies to. If not specified, excludes all methods.
   */
  methods?: HttpMethod[];
}

/**
 * Global rate limiter configuration.
 */
export interface RateLimiterConfig {
  /**
   * Whether to enable the rate limiter.
   * @default true
   */
  enabled?: boolean;

  /**
   * Default rate limit applied to all routes not matching specific rules.
   */
  defaultLimit: {
    maxRequests: number;
    windowSeconds: number;
  };

  /**
   * Secret used for hashing IP addresses for GDPR compliance.
   */
  secret: string;

  /**
   * Redis database number to use for rate limiting.
   */
  redisDatabase: number;

  /**
   * Route-specific rate limit rules. Rules are evaluated in order; first match wins.
   */
  rules: RateLimitRule[];

  /**
   * Routes to exclude from rate limiting. Exclusions are checked before rules.
   * If a request matches an exclusion, it bypasses rate limiting entirely.
   */
  exclusions?: RateLimitExclusion[];
}

/**
 * Rate limit check result.
 */
export interface RateLimitResult {
  /**
   * Whether the request is allowed.
   */
  allowed: boolean;

  /**
   * Maximum requests allowed in the window.
   */
  limit: number;

  /**
   * Remaining requests in the current window.
   */
  remaining: number;

  /**
   * Time until the rate limit resets (in seconds).
   */
  resetIn: number;

  /**
   * Total number of requests made in the current window.
   */
  current: number;
}
