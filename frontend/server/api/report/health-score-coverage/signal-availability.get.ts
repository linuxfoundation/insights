// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "Availability of each signal" widget (IN-1290). Not yet wired into
// the shared health-score-coverage report view/service - see
// health-score-coverage-signal-availability.types.ts.

import { fetchHealthScoreCoverageSignalAvailability } from '~~/server/data/tinybird/report/health-score-coverage-signal-availability';
import type {
  HealthScoreCoverageScope,
  HealthScoreCoverageSignalAvailabilityData,
} from '~~/types/report/health-score-coverage-signal-availability.types';

const VALID_SCOPES: HealthScoreCoverageScope[] = ['all', 'lf', 'other'];

export default defineEventHandler(
  async (event): Promise<HealthScoreCoverageSignalAvailabilityData> => {
    const query = getQuery(event);
    const scope = (query.scope as string) || 'all';

    if (!VALID_SCOPES.includes(scope as HealthScoreCoverageScope)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid scope: ${scope}` });
    }

    try {
      return await fetchHealthScoreCoverageSignalAvailability(scope as HealthScoreCoverageScope);
    } catch (error: unknown) {
      console.error('[health-score-coverage/signal-availability] error:', error);
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch health score coverage signal availability',
      });
    }
  },
);
