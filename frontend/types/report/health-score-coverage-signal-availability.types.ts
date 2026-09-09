// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Availability of each signal" widget (IN-1290, widget 05 of the
// Health Score Coverage report, epic IN-1276). Kept in its own file rather than the shared
// types/report/health-score-coverage.types.ts because that file is edited sequentially by each
// widget ticket in merge order, and it isn't IN-1290's turn yet (IN-1285's insights PR #2164,
// IN-1286's insights PR #2165 and IN-1287's insights PR #2166 are still open). Will be merged into
// the shared types file in a follow-up.

export type HealthScoreCoverageScope = 'all' | 'lf' | 'other';

// Raw TB row from `health_score_report_signal_availability`: one row per signal.
export interface HealthScoreCoverageSignalAvailabilityRow {
  signal_key: string;
  category_key: string;
  available_pct: number;
  repos_available: number;
  repos_tracked: number;
}

// One signal's availability, ready for the chart. Rows are sorted by `availablePct` descending.
export interface HealthScoreCoverageSignalAvailabilityCount {
  signalKey: string;
  categoryKey: string;
  availablePct: number;
  reposAvailable: number;
  reposTracked: number;
}

export interface HealthScoreCoverageSignalAvailabilityData {
  signals: HealthScoreCoverageSignalAvailabilityCount[];
}
