// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "Availability of each signal" widget (IN-1290). Kept out of the
// shared server/data/tinybird/report/health-score-coverage.ts file for the same merge-order reason
// as the types file next to it - see health-score-coverage-signal-availability.types.ts.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageScope,
  HealthScoreCoverageSignalAvailabilityCount,
  HealthScoreCoverageSignalAvailabilityData,
  HealthScoreCoverageSignalAvailabilityRow,
} from '~~/types/report/health-score-coverage-signal-availability.types';

/**
 * Maps the raw `health_score_report_signal_availability` rows into the shape the chart consumes,
 * sorted by `availablePct` descending (the pipe already sorts this way, but the mapper doesn't
 * rely on that).
 */
export function mapHealthScoreCoverageSignalAvailabilityRows(
  rows: HealthScoreCoverageSignalAvailabilityRow[],
): HealthScoreCoverageSignalAvailabilityData {
  const signals: HealthScoreCoverageSignalAvailabilityCount[] = rows
    .map((row) => ({
      signalKey: row.signal_key,
      categoryKey: row.category_key,
      availablePct: row.available_pct,
      reposAvailable: row.repos_available,
      reposTracked: row.repos_tracked,
    }))
    .sort((a, b) => b.availablePct - a.availablePct);

  return { signals };
}

export async function fetchHealthScoreCoverageSignalAvailability(
  scope: HealthScoreCoverageScope = 'all',
): Promise<HealthScoreCoverageSignalAvailabilityData> {
  const result = await fetchFromTinybird<HealthScoreCoverageSignalAvailabilityRow[]>(
    '/v0/pipes/health_score_report_signal_availability.json',
    { scope },
  );

  return mapHealthScoreCoverageSignalAvailabilityRows(result.data);
}
