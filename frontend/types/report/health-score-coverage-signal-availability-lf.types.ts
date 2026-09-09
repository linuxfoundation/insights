// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Signal availability inside and outside the Linux Foundation" widget
// (IN-1291, widget 06 of the Health Score Coverage report, epic IN-1276). Kept in its own file
// rather than the shared types/report/health-score-coverage.types.ts because that file is edited
// sequentially by each widget ticket in merge order, and it isn't IN-1291's turn yet. Will be
// merged into the shared types file in a follow-up. Not imported from IN-1290's
// health-score-coverage-signal-availability.types.ts - that widget's insights PR hasn't merged
// into this release branch yet, so its files don't exist here.

export type HealthScoreCoverageSignalAvailabilityLfScope = 'lf' | 'other';

// Raw TB row from `health_score_report_signal_availability`, called once per scope.
export interface HealthScoreCoverageSignalAvailabilityLfRow {
  signal_key: string;
  category_key: string;
  available_pct: number;
  repos_available: number;
  repos_tracked: number;
}

// One signal's availability for a single scope (lf or other).
export interface HealthScoreCoverageSignalAvailabilityLfScopeCount {
  availablePct: number;
  reposAvailable: number;
  reposTracked: number;
}

// One signal paired across both scopes, ready for the chart.
export interface HealthScoreCoverageSignalAvailabilityLfSignal {
  signalKey: string;
  categoryKey: string;
  lf: HealthScoreCoverageSignalAvailabilityLfScopeCount;
  other: HealthScoreCoverageSignalAvailabilityLfScopeCount;
}

export interface HealthScoreCoverageSignalAvailabilityLfData {
  signals: HealthScoreCoverageSignalAvailabilityLfSignal[];
  lfReposTracked: number;
  otherReposTracked: number;
}
