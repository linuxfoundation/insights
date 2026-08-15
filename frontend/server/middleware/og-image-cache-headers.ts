// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Middleware that adds cache control headers to OG image responses, differentiated
 * by the final response status so a fallback/error response isn't cached as long as
 * a real render. The status code is only known once the response is actually sent,
 * so this hooks res.writeHead (also invoked implicitly by Node on res.end()) rather
 * than setting a header unconditionally up front.
 */

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

export default defineEventHandler((event) => {
  const path = event.path;
  if (!path?.startsWith('/__og-image__/')) return;

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
});
