// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchHealthScoreCoverageGlance } from '~~/server/data/tinybird/report/health-score-coverage';
import type { HealthScoreCoverageGlanceData } from '~~/types/report/health-score-coverage.types';
import { logError } from '~~/server/utils/log';

export default defineEventHandler(async (): Promise<HealthScoreCoverageGlanceData> => {
  try {
    return await fetchHealthScoreCoverageGlance();
  } catch (error: unknown) {
    logError('health-score-coverage/glance', 'Failed to fetch health score coverage glance', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score coverage glance data',
    });
  }
});
