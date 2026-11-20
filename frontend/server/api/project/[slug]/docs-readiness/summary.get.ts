// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchDocsReadinessSummary } from '~~/server/data/tinybird/docs-readiness/summary';
import type { DocsReadinessSummary } from '~~/types/docs-readiness/readiness.types';

export default defineEventHandler(async (event): Promise<DocsReadinessSummary> => {
  const project = (event.context.params as { slug: string }).slug;
  try {
    const summary = await fetchDocsReadinessSummary(project);
    if (!summary) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' });
    }
    return summary;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404) {
      throw err;
    }
    console.error('Error fetching docs readiness summary:', err);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
