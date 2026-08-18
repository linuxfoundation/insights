// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { sendRedirect } from 'h3';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ProjectTinybird } from '~~/types/project';

const OG_IMAGE_PREFIX = '/__og-image__/';
const OG_IMAGE_COLLECTION_PREFIX = '/__og-image__/image/collection/';
const OG_IMAGE_PROJECT_PREFIX = '/__og-image__/image/project/';

// ---- bot rate limiting ----
// Prevents bot crawlers (bingbot, PetalBot, Amzn-SearchBot, etc.) from
// overwhelming the rendering service under high concurrency. Simple
// in-memory token bucket rate limiter per bot; returns 429 on limit exceeded.

const BOT_PATTERNS = [
  'bingbot',
  'PetalBot',
  'Amzn-SearchBot',
  'googlebot',
  'baiduspider',
  'yandexbot',
];

const RATE_LIMIT_CONFIG = {
  requestsPerSecond: 5, // Allow 5 requests per second per bot
  windowSizeMs: 1000, // 1 second window
};

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
      return pattern;
    }
  }
  return null;
}

function isRateLimited(botId: string): boolean {
  const now = Date.now();
  const tracked = requestTracking.get(botId);

  if (!tracked || now >= tracked.resetTime) {
    requestTracking.set(botId, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowSizeMs,
    });
    return false;
  }

  if (tracked.count >= RATE_LIMIT_CONFIG.requestsPerSecond) {
    return true;
  }

  tracked.count += 1;
  return false;
}

// ---- cache headers ----
// Adds cache control headers to OG image responses, differentiated by the final
// response status so a fallback/error response isn't cached as long as a real
// render. The status code is only known once the response is actually sent, so
// this hooks res.writeHead (also invoked implicitly by Node on res.end()) rather
// than setting a header unconditionally up front.

const CACHE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours — successful render
const FALLBACK_CACHE_MAX_AGE_SECONDS = 60 * 5; // 5 minutes — static fallback redirect
const STALE_WHILE_REVALIDATE = 60 * 60 * 24 * 7; // 7 days

function cacheControlFor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return `public, max-age=${CACHE_MAX_AGE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`;
  }
  if (statusCode >= 300 && statusCode < 400) {
    return `public, max-age=${FALLBACK_CACHE_MAX_AGE_SECONDS}`;
  }
  return 'no-cache, no-store, must-revalidate';
}

// ---- render timeout ----
// @nuxt/og-image's renderer has no cancellation hook we can wire an AbortSignal
// into, so the in-flight render isn't actually cancelled when the timeout fires.
// shortcut: the client still gets the static fallback within OG_IMAGE_RENDER_TIMEOUT_MS
// instead of hanging, but the render keeps running server-side until it finishes on
// its own. revisit: if sustained timeouts under load show up as CPU/memory pressure,
// or nuxt-og-image adds a real render-abort hook.

const OG_IMAGE_RENDER_TIMEOUT_MS = 8000; // 8 second timeout for rendering

export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path?.startsWith(OG_IMAGE_PREFIX)) return;

  // 1. Bot rate limiting — reject before doing any other work
  const userAgent = getHeader(event, 'user-agent') || '';
  const botId = getBotIdentifier(userAgent);
  if (botId && isRateLimited(botId)) {
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

  // 2. Cache-Control header patch, applied to every OG image response
  const res = event.node.res;
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = ((statusCode: number, ...args: unknown[]) => {
    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', cacheControlFor(statusCode));
      res.setHeader('Vary', 'User-Agent');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalWriteHead as any)(statusCode, ...args);
  }) as typeof res.writeHead;

  // 3. Entity existence validation — redirect to the static fallback instead of
  // letting the rendering pipeline throw a 500 for a removed/archived slug.
  // Uses the same Tinybird pipes as their respective API endpoints to avoid
  // discrepancies between data sources.
  if (path.startsWith(OG_IMAGE_COLLECTION_PREFIX)) {
    const slug = path.slice(OG_IMAGE_COLLECTION_PREFIX.length).split('/')[0];
    if (slug) {
      try {
        const collectionRes = await fetchFromTinybird<Record<string, unknown>[]>(
          '/v0/pipes/collections_list.json',
          { slug },
        );
        if (!collectionRes.data || collectionRes.data.length === 0) {
          return sendRedirect(event, '/og-image.png', 302);
        }
      } catch (error) {
        console.warn({
          type: 'og-image-collection-validation-error',
          slug,
          error: error instanceof Error ? error.message : String(error),
          message: 'Could not validate collection',
        });
        return sendRedirect(event, '/og-image.png', 302);
      }
    }
  } else if (path.startsWith(OG_IMAGE_PROJECT_PREFIX)) {
    const slug = path.slice(OG_IMAGE_PROJECT_PREFIX.length).split('/')[0];
    if (slug) {
      try {
        const projectRes = await fetchFromTinybird<ProjectTinybird[]>(
          '/v0/pipes/projects_list.json',
          {
            slug,
            details: true,
          },
        );
        if (!projectRes.data || projectRes.data.length === 0) {
          return sendRedirect(event, '/og-image.png', 302);
        }
      } catch {
        return sendRedirect(event, '/og-image.png', 302);
      }
    }
  }

  // 4. Render timeout — send the static fallback if rendering takes too long
  const timeoutId = setTimeout(() => {
    if (event.node.res.headersSent || event.node.res.writableEnded) return;
    console.warn({
      type: 'og-image-render-timeout',
      path,
      timeoutMs: OG_IMAGE_RENDER_TIMEOUT_MS,
      message: 'OG image rendering timeout, sending fallback',
    });
    sendRedirect(event, '/og-image.png', 302);
  }, OG_IMAGE_RENDER_TIMEOUT_MS);
  timeoutId.unref?.();

  event.node.res.once('finish', () => {
    clearTimeout(timeoutId);
  });
});
