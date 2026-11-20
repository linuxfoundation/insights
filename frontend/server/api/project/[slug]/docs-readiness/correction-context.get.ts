// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

import { DocsReadinessRepository } from '~~/server/repo/docsReadiness.repo';
import type { DocsCorrectionContext } from '~~/types/docs-readiness/correction.types';

/**
 * API Endpoint: /api/project/:slug/docs-readiness/correction-context
 * Method: GET
 * Description: Returns the options for correcting a project's documentation URL and the
 * date of the active override, if any.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the project.
 *
 * Response:
 * - currentDocsUrl (string | null): Docs URL of the latest readiness run; null for repo-only projects.
 * - candidates (array): Live discovered URLs, the current one first with isCurrent true.
 * - override (object | null): { docsUrl (null = confirmed no docs), submittedAt (ISO) } of the active override.
 *
 * Errors:
 * - 404: Project not found
 * - 503: Database not available
 * - 500: Internal server error
 */
export default defineEventHandler(async (event): Promise<DocsCorrectionContext> => {
  const { slug } = event.context.params as { slug: string };
  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  let context: DocsCorrectionContext | null;
  try {
    context = await new DocsReadinessRepository(cmDbPool).findCorrectionContextBySlug(slug);
  } catch (error) {
    console.error('Error fetching docs correction context:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }

  if (!context) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  return context;
});
