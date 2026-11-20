// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchDocsReadinessHistory } from '~~/server/data/tinybird/docs-readiness/history';
import type { DocsReadinessHistory } from '~~/types/docs-readiness/readiness.types';

export default defineEventHandler(async (event): Promise<DocsReadinessHistory> => {
  const project = (event.context.params as { slug: string }).slug;
  try {
    return await fetchDocsReadinessHistory(project);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404) {
      throw err;
    }
    console.error('Error fetching docs readiness history:', err);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
