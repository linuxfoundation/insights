// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Rate limiting middleware for bot requests to OG image endpoints.
 * Prevents bot crawlers (bingbot, PetalBot, Amzn-SearchBot, etc.) from
 * overwhelming the rendering service under high concurrency.
 *
 * Implements a simple in-memory token bucket rate limiter per bot.
 * On limit exceeded, returns 429 (Too Many Requests).
 */

// Bot user agent patterns that should be rate limited
const BOT_PATTERNS = [
  'bingbot',
  'PetalBot',
  'Amzn-SearchBot',
  'googlebot',
  'baiduspider',
  'yandexbot',
];

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  requestsPerSecond: 5, // Allow 5 requests per second per bot
  windowSizeMs: 1000, // 1 second window
};

// In-memory store for tracking requests per bot
const requestTracking = new Map<string, { count: number; resetTime: number }>();

// Periodically sweep expired windows so stale entries don't linger between bursts
const CLEANUP_INTERVAL_MS = 10_000;
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [botId, tracked] of requestTracking) {
    if (now >= tracked.resetTime) {
      requestTracking.delete(botId);
    }
  }
}, CLEANUP_INTERVAL_MS);
cleanupInterval.unref?.();

function getBotIdentifier(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();
  for (const pattern of BOT_PATTERNS) {
    if (ua.includes(pattern.toLowerCase())) {
      // Extract the actual bot name for tracking
      return pattern;
    }
  }
  return null;
}

function isRateLimited(botId: string): boolean {
  const now = Date.now();
  const tracked = requestTracking.get(botId);

  if (!tracked || now >= tracked.resetTime) {
    // New window or first request
    requestTracking.set(botId, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowSizeMs,
    });
    return false;
  }

  // Check if we've exceeded the limit
  if (tracked.count >= RATE_LIMIT_CONFIG.requestsPerSecond) {
    return true;
  }

  // Increment counter
  tracked.count += 1;
  return false;
}

export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path?.startsWith('/__og-image__/')) return;

  const userAgent = getHeader(event, 'user-agent') || '';
  const botId = getBotIdentifier(userAgent);

  if (!botId) {
    // Not a known bot, allow through
    return;
  }

  if (isRateLimited(botId)) {
    // Rate limit exceeded for this bot
    console.warn({
      type: 'og-image-rate-limit-exceeded',
      bot: botId,
      path,
      message: 'Bot exceeded rate limit',
    });
    return sendError(
      event,
      createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        data: {
          message: 'Rate limit exceeded for bot requests',
          retryAfter: RATE_LIMIT_CONFIG.windowSizeMs / 1000,
        },
      }),
    );
  }
});
