// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { sendRedirect } from 'h3';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ProjectTinybird } from '~~/types/project';

const OG_IMAGE_PROJECT_PREFIX = '/__og-image__/image/project/';

/**
 * Middleware that validates project existence before OG image generation.
 * If the project doesn't exist (slug removed/moved), redirects to the
 * default static OG image instead of letting the rendering pipeline
 * throw a 500.
 *
 * Uses the same Tinybird pipe (projects_list) as the project API endpoint
 * to avoid discrepancies between data sources.
 */
export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path?.startsWith(OG_IMAGE_PROJECT_PREFIX)) return;

  // Extract project slug from: /__og-image__/image/project/{slug}/...
  const slug = path.slice(OG_IMAGE_PROJECT_PREFIX.length).split('/')[0];
  if (!slug) return;

  try {
    const res = await fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {
      slug,
      details: true,
    });
    if (!res.data || res.data.length === 0) {
      return sendRedirect(event, '/og-image.png', 302);
    }
  } catch {
    return sendRedirect(event, '/og-image.png', 302);
  }
});
