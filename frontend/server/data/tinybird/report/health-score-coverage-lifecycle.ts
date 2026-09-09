// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "How projects are maintained" widget (IN-1287). Kept out of the
// shared server/data/tinybird/report/health-score-coverage.ts file for the same merge-order reason
// as the types file next to it - see health-score-coverage-lifecycle.types.ts.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageLifecycleCount,
  HealthScoreCoverageLifecycleData,
  HealthScoreCoverageLifecycleRow,
  HealthScoreCoverageScope,
} from '~~/types/report/health-score-coverage-lifecycle.types';

/**
 * Maps the raw `health_score_report_lifecycle` rows into the shape the chart consumes: the NULL
 * label becomes 'unavailable', and rows are sorted by project count descending.
 */
export function mapHealthScoreCoverageLifecycleRows(
  rows: HealthScoreCoverageLifecycleRow[],
): HealthScoreCoverageLifecycleData {
  const counts: HealthScoreCoverageLifecycleCount[] = rows
    .map((row) => ({ label: row.label ?? 'unavailable', projects: row.projects }))
    .sort((a, b) => b.projects - a.projects);

  return {
    rows: counts,
    total: counts.reduce((sum, row) => sum + row.projects, 0),
  };
}

export async function fetchHealthScoreCoverageLifecycle(
  scope: HealthScoreCoverageScope = 'all',
): Promise<HealthScoreCoverageLifecycleData> {
  const result = await fetchFromTinybird<HealthScoreCoverageLifecycleRow[]>(
    '/v0/pipes/health_score_report_lifecycle.json',
    { scope },
  );

  return mapHealthScoreCoverageLifecycleRows(result.data);
}
