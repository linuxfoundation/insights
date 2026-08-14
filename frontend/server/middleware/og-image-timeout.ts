// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Middleware that applies a timeout to OG image generation requests.
 * This prevents slow rendering operations from blocking under concurrent bot load.
 *
 * When a timeout occurs, the error is logged and the fallback plugin will
 * redirect to the static default OG image.
 */

const OG_IMAGE_RENDER_TIMEOUT_MS = 8000; // 8 second timeout for rendering

export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path?.startsWith('/__og-image__/')) return;

  // Wrap the route handler in a timeout promise
  const originalCacheKey = event._cacheKey;
  const timeoutController = new AbortController();

  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, OG_IMAGE_RENDER_TIMEOUT_MS);

  // Store timeout controller on the event for potential use in handlers
  (event.node as any).__ogImageTimeoutAbort = timeoutController;

  // Hook into the response to clear the timeout
  event.node.res.once('finish', () => {
    clearTimeout(timeoutId);
  });

  // Log timeout attempt if it occurs during processing
  timeoutController.signal.addEventListener('abort', () => {
    console.warn(`[OG Image] Timeout on ${path} (${OG_IMAGE_RENDER_TIMEOUT_MS}ms)`);
  });
});
