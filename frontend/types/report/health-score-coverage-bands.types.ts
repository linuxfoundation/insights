// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Health score bands" widget (IN-1286, widget 01 of the Health Score
// Coverage report, epic IN-1276). Kept in its own file rather than the shared
// types/report/health-score-coverage.types.ts because that file is edited sequentially by each
// widget ticket in merge order, and it isn't IN-1286's turn yet (IN-1285's insights PR #2164 is
// still open). Will be merged into the shared types file in a follow-up.

export type HealthScoreCoverageScope = 'all' | 'lf' | 'other';

// Raw TB row from `health_score_report_bands`: one row per (band, covered) pair.
export interface HealthScoreCoverageBandsRow {
  band: string;
  covered: number;
  projects: number;
}

// One health-score band's project counts, split by full (3 categories) vs partial (2 categories)
// scoring. Bands the pipe didn't return for a scope are filled in with 0.
export interface HealthScoreCoverageBandCount {
  band: string;
  full: number;
  partial: number;
}

export interface HealthScoreCoverageBandsData {
  bands: HealthScoreCoverageBandCount[];
  fullTotal: number;
  partialTotal: number;
}
