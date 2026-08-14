// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Middleware that adds cache control headers to OG image responses.
 * This enables browser and CDN caching to reduce rendering load from
 * repeated bot crawler requests and user shares.
 */

// Cache duration: 24 hours (production), shorter for development
const CACHE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const STALE_WHILE_REVALIDATE = 60 * 60 * 24 * 7; // 7 days

export default defineEventHandler((event) => {
  const path = event.path;
  if (!path?.startsWith('/__og-image__/')) return;

  // Set cache headers before response is sent
  // This allows CDN and browsers to cache the generated images
  setHeader(
    event,
    'Cache-Control',
    `public, max-age=${CACHE_MAX_AGE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`
  );

  // Add immutable hint for versioned resources
  setHeader(event, 'X-Cache-Strategy', 'og-image-cache-v1');

  // Vary by User-Agent is important because we might serve different images
  // based on device/bot characteristics (though currently we don't)
  // Still good practice to declare for cache correctness
  setHeader(event, 'Vary', 'User-Agent');

  // Log cache headers being applied
  onBeforeSendResponse(async (context) => {
    if (context.event.path?.startsWith('/__og-image__/')) {
      console.debug(
        `[OG Image Cache] Applied cache headers to ${context.event.path} (max-age: ${CACHE_MAX_AGE_SECONDS}s)`
      );
    }
  });
});
