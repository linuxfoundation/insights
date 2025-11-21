// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { createHash, randomUUID } from 'crypto';
import { type H3Event, getHeaders } from 'h3';
import { RedisClientType } from '@redis/client';
import {
  RateLimitRule,
  RateLimitResult,
  HttpMethod,
  RateLimiterConfig,
} from '../types/rate-limiter';

/**
 * Extracts the client IP address from the request, taking into account headers that may have been
 * set by proxies and load balancers, like X-Forwarded-For, X-Real-IP, etc.
 *
 * @param event - The H3 event object
 * @returns The client IP address or 'unknown' if not found
 */
function getClientIp(event: H3Event): string {
  // Check common proxy headers first
  const headers = getHeaders(event);

  // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
  // We want the first (leftmost) IP which is the original client
  const xForwardedFor = headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) {
      return ips[0];
    }
  }

  // Check other common headers
  const xRealIp = headers['x-real-ip'];
  if (xRealIp) {
    return xRealIp;
  }

  // Cloudflare
  const cfConnectingIp = headers['cf-connecting-ip'];
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xClientIp = headers['x-client-ip'];
  if (xClientIp) {
    return xClientIp;
  }

  // Fallback to Node's request IP
  const nodeReq = event.node.req;
  const remoteAddress = nodeReq.socket?.remoteAddress;
  if (remoteAddress) {
    // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
    return remoteAddress.replace(/^::ffff:/, '');
  }

  return 'unknown';
}

/**
 * Gets and hashes the client IP address, salted with a secret.
 * We don't want to store raw IPs for GDPR compliance.
 * The idea of salting is to prevent rainbow table attacks if the hashes are ever leaked.
 * Perhaps a little too much for something like this, especially as the hashes are not even meant
 * to be stored for a long time, but it's here if we want it. We can just leave the secret empty
 * or set to a hard-coded random string in the configuration, if we don't care about this.
 *
 * @param event - The H3 event object
 * @param secret - Secret to salt the hash
 * @returns The hashed client IP address
 */
function getHashedClientIp(event: H3Event, secret: string): string {
  const ip = getClientIp(event);
  const input = `${ip}:${secret}`;
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Checks if a route matches a pattern (supports wildcards).
 *
 * @param route - The actual route path
 * @param pattern - The pattern to match against (supports * wildcard)
 * @returns true if the route matches the pattern
 */
function matchesRoute(route: string, pattern: string): boolean {
  // Exact match
  if (route === pattern) {
    return true;
  }

  // Wildcard matching
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\*/g, '.*'); // Replace * with .*

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(route);
  }

  return false;
}

/**
 * Finds the rate limit rule that applies to the current request.
 *
 * @param event - The H3 event object
 * @param rules - Array of rate limit rules
 * @returns The matching rule or null if no specific rule matches
 */
function findMatchingRule(event: H3Event, rules: RateLimitRule[]): RateLimitRule | null {
  const path = event.path;
  const method = event.method.toUpperCase() as HttpMethod;

  // Find the first matching rule
  for (const rule of rules) {
    // Check if route matches
    if (!matchesRoute(path, rule.route)) {
      continue;
    }

    // Check if method matches (if methods are specified)
    if (rule.methods && rule.methods.length > 0) {
      if (!rule.methods.includes(method)) {
        continue;
      }
    }

    // Found a match
    return rule;
  }

  return null;
}

/**
 * checkRateLimitInRedis talks to Redis and does the math to check the rate limit for a request.
 * If we ever want to swap out Redis for another store, we can create a different
 * "checkRateLimitInX" function that implements the same logic using a different backend.
 *
 * @param hashedIp - The hashed IP address
 * @param key - The Redis key to use
 * @param maxRequests - Maximum requests allowed
 * @param windowSeconds - Time window in seconds
 * @param redisClient - The Redis client instance
 * @returns Rate limit check result
 */
async function checkRateLimitInRedis(
  hashedIp: string,
  key: string,
  maxRequests: number,
  windowSeconds: number,
  redisClient: RedisClientType,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Create a unique key for this IP + route + method combination
  const redisKey = `ratelimit:${key}:${hashedIp}`;

  // Use Redis sorted set to track requests within the time window
  // Score is the timestamp, value is a unique identifier
  const requestId = `${now}-${randomUUID()}`;

  // Remove old requests outside the time window
  await redisClient.zRemRangeByScore(redisKey, 0, now - windowMs);

  // Add current request
  await redisClient.zAdd(redisKey, {
    score: now,
    value: requestId,
  });

  // Set expiration on the key (clean-up)
  await redisClient.expire(redisKey, windowSeconds + 10);

  // Count requests in the current window
  const count = await redisClient.zCount(redisKey, now - windowMs, now);

  // Calculate time until reset
  const oldestRequest = await redisClient.zRange(redisKey, 0, 0);
  let resetIn = windowSeconds;
  if (oldestRequest.length > 0) {
    const oldestScore = await redisClient.zScore(redisKey, oldestRequest[0]);
    if (oldestScore !== null) {
      resetIn = Math.ceil((oldestScore + windowMs - now) / 1000);
    }
  }

  const remaining = Math.max(0, maxRequests - count);
  const allowed = count <= maxRequests;

  return {
    allowed,
    limit: maxRequests,
    remaining,
    resetIn,
    current: count,
  };
}

/**
 * Main rate limiter function. Checks if a request should be rate limited.
 *
 * @param event - The H3 event object
 * @param rateLimiterConfig - The rate limiter configuration
 * @param redisClient - The Redis client instance
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  event: H3Event,
  rateLimiterConfig: RateLimiterConfig,
  redisClient: RedisClientType,
): Promise<RateLimitResult> {
  // Get hashed IP address for GDPR compliance.
  const hashedIp = getHashedClientIp(event, rateLimiterConfig.secret);

  const matchingRule = findMatchingRule(event, rateLimiterConfig.rules);

  // Determine limits to apply
  const maxRequests = matchingRule?.maxRequests ?? rateLimiterConfig.defaultLimit.maxRequests;
  const windowSeconds = matchingRule?.windowSeconds ?? rateLimiterConfig.defaultLimit.windowSeconds;

  // Create a unique key for this route + method combination
  const path = event.path;
  const method = event.method.toUpperCase();
  const key = `${method}:${path}`;

  return await checkRateLimitInRedis(hashedIp, key, maxRequests, windowSeconds, redisClient);
}
