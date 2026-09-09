// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "Repositories scoring full marks" widget (IN-1292). Not yet wired
// into the shared health-score-coverage report view/service - see
// health-score-coverage-category-maximum.types.ts.
//
// No `scope` query param - this pipe is not scope-filtered per the ticket.

import { fetchHealthScoreCoverageCategoryMaximum } from '~~/server/data/tinybird/report/health-score-coverage-category-maximum';
import type { HealthScoreCoverageCategoryMaximumData } from '~~/types/report/health-score-coverage-category-maximum.types';

export default defineEventHandler(async (): Promise<HealthScoreCoverageCategoryMaximumData> => {
  try {
    return await fetchHealthScoreCoverageCategoryMaximum();
  } catch (error: unknown) {
    console.error('[health-score-coverage/category-maximum] error:', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score coverage category maximum',
    });
  }
});
