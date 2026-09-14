// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "Signal availability inside and outside the Linux Foundation"
// widget (IN-1291). Kept out of the shared server/data/tinybird/report/health-score-coverage.ts
// file for the same merge-order reason as the types file next to it - see
// health-score-coverage-signal-availability-lf.types.ts.
//
// Reuses the `health_score_report_signal_availability` pipe already deployed for IN-1290
// (crowd.dev PR #4581), calling it twice with `scope=lf` and `scope=other` and pairing the rows
// by `signal_key`.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageSignalAvailabilityLfData,
  HealthScoreCoverageSignalAvailabilityLfRow,
} from '~~/types/report/health-score-coverage-signal-availability-lf.types';

const PIPE_PATH = '/v0/pipes/health_score_report_signal_availability.json';

/**
 * Pairs the `lf` and `other` scope rows by `signal_key` into one combined row per signal. A
 * signal missing from either side (shouldn't happen - both calls cover the same fixed signal
 * set) is dropped rather than rendered with a missing series.
 */
export function combineHealthScoreCoverageSignalAvailabilityLfRows(
  lfRows: HealthScoreCoverageSignalAvailabilityLfRow[],
  otherRows: HealthScoreCoverageSignalAvailabilityLfRow[],
): HealthScoreCoverageSignalAvailabilityLfData {
  const otherBySignalKey = new Map(otherRows.map((row) => [row.signal_key, row]));

  const signals = lfRows
    .filter((lfRow) => otherBySignalKey.has(lfRow.signal_key))
    .map((lfRow) => {
      const otherRow = otherBySignalKey.get(
        lfRow.signal_key,
      ) as HealthScoreCoverageSignalAvailabilityLfRow;

      return {
        signalKey: lfRow.signal_key,
        categoryKey: lfRow.category_key,
        lf: {
          availablePct: lfRow.available_pct,
          reposAvailable: lfRow.repos_available,
          reposTracked: lfRow.repos_tracked,
        },
        other: {
          availablePct: otherRow.available_pct,
          reposAvailable: otherRow.repos_available,
          reposTracked: otherRow.repos_tracked,
        },
      };
    });

  return {
    signals,
    lfReposTracked: lfRows[0]?.repos_tracked ?? 0,
    otherReposTracked: otherRows[0]?.repos_tracked ?? 0,
  };
}

export async function fetchHealthScoreCoverageSignalAvailabilityLf(): Promise<HealthScoreCoverageSignalAvailabilityLfData> {
  const [lfResult, otherResult] = await Promise.all([
    fetchFromTinybird<HealthScoreCoverageSignalAvailabilityLfRow[]>(PIPE_PATH, { scope: 'lf' }),
    fetchFromTinybird<HealthScoreCoverageSignalAvailabilityLfRow[]>(PIPE_PATH, { scope: 'other' }),
  ]);

  return combineHealthScoreCoverageSignalAvailabilityLfRows(lfResult.data, otherResult.data);
}
