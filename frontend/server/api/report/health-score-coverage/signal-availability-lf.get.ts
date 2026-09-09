// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "Signal availability inside and outside the Linux Foundation"
// widget (IN-1291). Not yet wired into the shared health-score-coverage report view/service - see
// health-score-coverage-signal-availability-lf.types.ts.
//
// No `scope` query param, unlike IN-1290's signal-availability route - this widget always renders
// both the lf and other series together, so the fetcher below fetches both scopes internally.

import { fetchHealthScoreCoverageSignalAvailabilityLf } from '~~/server/data/tinybird/report/health-score-coverage-signal-availability-lf';
import type { HealthScoreCoverageSignalAvailabilityLfData } from '~~/types/report/health-score-coverage-signal-availability-lf.types';

export default defineEventHandler(
  async (): Promise<HealthScoreCoverageSignalAvailabilityLfData> => {
    try {
      return await fetchHealthScoreCoverageSignalAvailabilityLf();
    } catch (error: unknown) {
      console.error('[health-score-coverage/signal-availability-lf] error:', error);
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch health score coverage signal availability (LF vs other)',
      });
    }
  },
);
