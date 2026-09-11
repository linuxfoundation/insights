// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "Repositories we can score, by category" widget (IN-1289). Not yet
// wired into the shared health-score-coverage report view/service - see
// health-score-coverage-category-coverage.types.ts.
//
// No `scope` query param - this pipe is not scope-filtered per the ticket.

import { fetchHealthScoreCoverageCategoryCoverage } from '~~/server/data/tinybird/report/health-score-coverage-category-coverage';
import type { HealthScoreCoverageCategoryCoverageData } from '~~/types/report/health-score-coverage-category-coverage.types';
import { logError } from '~~/server/utils/log';

export default defineEventHandler(async (): Promise<HealthScoreCoverageCategoryCoverageData> => {
  try {
    return await fetchHealthScoreCoverageCategoryCoverage();
  } catch (error: unknown) {
    logError(
      'health-score-coverage/category-coverage',
      'Failed to fetch health score coverage category-coverage',
      error,
    );
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score coverage category coverage',
    });
  }
});
