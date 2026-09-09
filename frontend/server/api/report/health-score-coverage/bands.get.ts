// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "Health score bands" widget (IN-1286). Not yet wired into the
// shared health-score-coverage report view/service - see health-score-coverage-bands.types.ts.

import { fetchHealthScoreCoverageBands } from '~~/server/data/tinybird/report/health-score-coverage-bands';
import { logError } from '~~/server/utils/log';
import type {
  HealthScoreCoverageBandsData,
  HealthScoreCoverageScope,
} from '~~/types/report/health-score-coverage-bands.types';

const VALID_SCOPES: HealthScoreCoverageScope[] = ['all', 'lf', 'other'];

export default defineEventHandler(async (event): Promise<HealthScoreCoverageBandsData> => {
  const query = getQuery(event);
  const scope = (query.scope as string) || 'all';

  if (!VALID_SCOPES.includes(scope as HealthScoreCoverageScope)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid scope: ${scope}` });
  }

  try {
    return await fetchHealthScoreCoverageBands(scope as HealthScoreCoverageScope);
  } catch (error: unknown) {
    logError('health-score-coverage/bands', 'Failed to fetch health score coverage bands', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score coverage bands',
    });
  }
});
