// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "Where the strongest repositories pull ahead" widget (IN-1288).
// Kept out of the shared server/data/tinybird/report/health-score-coverage.ts file for the same
// merge-order reason as the types file next to it - see
// health-score-coverage-signal-scores.types.ts.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageSignalScore,
  HealthScoreCoverageSignalScoreRow,
  HealthScoreCoverageSignalScoresData,
} from '~~/types/report/health-score-coverage-signal-scores.types';

/**
 * Maps the raw `health_score_report_signal_scores` rows into the shape the chart consumes. The
 * pipe already returns one row per signal in a fixed order; the mapper doesn't rely on that and
 * passes rows through as-is (unlike the availability widgets, there's no natural sort key here -
 * display order is grouped by category in the component).
 */
export function mapHealthScoreCoverageSignalScoreRows(
  rows: HealthScoreCoverageSignalScoreRow[],
): HealthScoreCoverageSignalScoresData {
  const signals: HealthScoreCoverageSignalScore[] = rows.map((row) => ({
    signalKey: row.signal_key,
    categoryKey: row.category_key,
    p80Pct: row.p80_pct,
    medianPct: row.median_pct,
    repos: row.repos,
  }));

  return { signals };
}

export async function fetchHealthScoreCoverageSignalScores(): Promise<HealthScoreCoverageSignalScoresData> {
  const result = await fetchFromTinybird<HealthScoreCoverageSignalScoreRow[]>(
    '/v0/pipes/health_score_report_signal_scores.json',
    {},
  );

  return mapHealthScoreCoverageSignalScoreRows(result.data);
}
