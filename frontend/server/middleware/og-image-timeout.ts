// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { sendRedirect } from 'h3';

/**
 * Middleware that applies a timeout to OG image generation requests.
 * This prevents slow rendering operations from blocking under concurrent bot load.
 *
 * @nuxt/og-image's renderer has no cancellation hook we can wire an AbortSignal
 * into, so the in-flight render isn't actually cancelled when the timeout fires.
 * shortcut: the client still gets the static fallback within OG_IMAGE_RENDER_TIMEOUT_MS
 * instead of hanging, but the render keeps running server-side until it finishes on
 * its own. revisit: if sustained timeouts under load show up as CPU/memory pressure,
 * or nuxt-og-image adds a real render-abort hook.
 */

const OG_IMAGE_RENDER_TIMEOUT_MS = 8000; // 8 second timeout for rendering

export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path?.startsWith('/__og-image__/')) return;

  const timeoutId = setTimeout(() => {
    if (event.node.res.headersSent || event.node.res.writableEnded) return;
    console.warn(
      `[OG Image] Timeout on ${path} (${OG_IMAGE_RENDER_TIMEOUT_MS}ms), sending fallback`,
    );
    sendRedirect(event, '/og-image.png', 302);
  }, OG_IMAGE_RENDER_TIMEOUT_MS);

  event.node.res.once('finish', () => {
    clearTimeout(timeoutId);
  });
});
