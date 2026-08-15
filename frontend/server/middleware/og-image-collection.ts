// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { sendRedirect } from 'h3';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

const OG_IMAGE_COLLECTION_PREFIX = '/__og-image__/image/collection/';

/**
 * Middleware that validates collection existence before OG image generation.
 * If the collection doesn't exist (deleted/archived), redirects to the
 * default static OG image instead of letting the rendering pipeline
 * throw a 500.
 *
 * Prevents bot crawlers from receiving error responses when accessing
 * outdated collection links.
 */
export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path?.startsWith(OG_IMAGE_COLLECTION_PREFIX)) return;

  // Extract collection slug from: /__og-image__/image/collection/{slug}/...
  const slug = path.slice(OG_IMAGE_COLLECTION_PREFIX.length).split('/')[0];
  if (!slug) return;

  try {
    // Query Tinybird for collection details
    // Using a collections endpoint if available, or fallback to projects with collection filter
    const res = await fetchFromTinybird<Record<string, unknown>[]>(
      '/v0/pipes/collections_list.json',
      {
        slug,
        details: true,
      },
    );

    if (!res.data || res.data.length === 0) {
      // Collection not found, serve static fallback
      return sendRedirect(event, '/og-image.png', 302);
    }
  } catch (error) {
    // On any error (network, parsing, etc.), fallback to static image
    // This prevents rendering failures from cascading
    console.warn(
      `[OG Image Collection] Could not validate collection "${slug}":`,
      error instanceof Error ? error.message : String(error),
    );
    return sendRedirect(event, '/og-image.png', 302);
  }
});
