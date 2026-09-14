// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "How projects are maintained" widget (IN-1287, widget 02 of the
// Health Score Coverage report, epic IN-1276). Kept in its own file rather than the shared
// types/report/health-score-coverage.types.ts because that file is edited sequentially by each
// widget ticket in merge order, and it isn't IN-1287's turn yet (IN-1285's insights PR #2164 and
// IN-1286's insights PR #2165 are still open). Will be merged into the shared types file in a
// follow-up.

export type HealthScoreCoverageScope = 'all' | 'lf' | 'other';

// Raw TB row from `health_score_report_lifecycle`: one row per `lifecycleLabel` value, or `null`
// when the project has no linked package data to derive a lifecycle state from.
export interface HealthScoreCoverageLifecycleRow {
  label: string | null;
  projects: number;
}

// One lifecycle label's project count, ready for the chart. `label` is the raw lifecycleLabel
// value (active, stable, declining, inert, abandoned, archived) or 'unavailable' for the NULL
// row. Rows are sorted by `projects` descending.
export interface HealthScoreCoverageLifecycleCount {
  label: string;
  projects: number;
}

export interface HealthScoreCoverageLifecycleData {
  rows: HealthScoreCoverageLifecycleCount[];
  total: number;
}
