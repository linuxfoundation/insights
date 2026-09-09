// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "Where the strongest repositories pull ahead" widget (IN-1288).
// Not yet wired into the shared health-score-coverage report view/service - see
// health-score-coverage-signal-scores.types.ts.
//
// No `scope` query param - this pipe is not scope-filtered per the ticket.

import { fetchHealthScoreCoverageSignalScores } from '~~/server/data/tinybird/report/health-score-coverage-signal-scores';
import type { HealthScoreCoverageSignalScoresData } from '~~/types/report/health-score-coverage-signal-scores.types';
import { logError } from '~~/server/utils/log';

export default defineEventHandler(async (): Promise<HealthScoreCoverageSignalScoresData> => {
  try {
    return await fetchHealthScoreCoverageSignalScores();
  } catch (error: unknown) {
    logError(
      'health-score-coverage/signal-scores',
      'Failed to fetch health score coverage signal-scores',
      error,
    );
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score coverage signal scores',
    });
  }
});
