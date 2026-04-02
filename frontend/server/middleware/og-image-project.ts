// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { sendRedirect } from 'h3';
import { getBucketIdForProject } from '~~/server/data/tinybird/bucket-cache';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

const OG_IMAGE_PROJECT_PREFIX = '/__og-image__/image/project/';

/**
 * Middleware that validates project existence before OG image generation.
 * If the project doesn't exist (slug removed/moved), redirects to the
 * default static OG image instead of letting the rendering pipeline
 * throw a 500.
 */
export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path?.startsWith(OG_IMAGE_PROJECT_PREFIX)) return;

  // Extract project slug from: /__og-image__/image/project/{slug}/...
  const slug = path.slice(OG_IMAGE_PROJECT_PREFIX.length).split('/')[0];
  if (!slug) return;

  try {
    const bucketId = await getBucketIdForProject(slug, fetchFromTinybird);
    if (bucketId === null) {
      return sendRedirect(event, '/og-image.png', 302);
    }
  } catch {
    return sendRedirect(event, '/og-image.png', 302);
  }
});
