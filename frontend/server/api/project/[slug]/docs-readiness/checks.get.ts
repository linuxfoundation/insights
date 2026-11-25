// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchDocsReadinessChecks } from '~~/server/data/tinybird/docs-readiness/checks';
import type { DocsReadinessChecks } from '~~/types/docs-readiness/readiness.types';

export default defineEventHandler(async (event): Promise<DocsReadinessChecks> => {
  const project = (event.context.params as { slug: string }).slug;
  try {
    return await fetchDocsReadinessChecks(project);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404) {
      throw err;
    }
    console.error('Error fetching docs readiness checks:', err);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
