// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "How projects are maintained" widget (IN-1287). Not yet wired into
// the shared health-score-coverage report view/service - see
// health-score-coverage-lifecycle.types.ts.

import { fetchHealthScoreCoverageLifecycle } from '~~/server/data/tinybird/report/health-score-coverage-lifecycle';
import { logError } from '~~/server/utils/log';
import type {
  HealthScoreCoverageLifecycleData,
  HealthScoreCoverageScope,
} from '~~/types/report/health-score-coverage-lifecycle.types';

const VALID_SCOPES: HealthScoreCoverageScope[] = ['all', 'lf', 'other'];

export default defineEventHandler(async (event): Promise<HealthScoreCoverageLifecycleData> => {
  const query = getQuery(event);
  const scope = (query.scope as string) || 'all';

  if (!VALID_SCOPES.includes(scope as HealthScoreCoverageScope)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid scope: ${scope}` });
  }

  try {
    return await fetchHealthScoreCoverageLifecycle(scope as HealthScoreCoverageScope);
  } catch (error: unknown) {
    logError(
      'health-score-coverage/lifecycle',
      'Failed to fetch health score coverage lifecycle',
      error,
    );
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score coverage lifecycle distribution',
    });
  }
});
