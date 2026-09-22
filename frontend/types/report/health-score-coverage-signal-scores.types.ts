// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Where the strongest repositories pull ahead" widget (IN-1288, widget
// 03 of the Health Score Coverage report, epic IN-1276). Kept in its own file rather than the
// shared types/report/health-score-coverage.types.ts because that file is edited sequentially by
// each widget ticket in merge order, and it isn't IN-1288's turn yet. Will be merged into the
// shared types file in a follow-up.

// The 10 percentile bands the pipe/chart work with, p10 through p100 in steps of 10.
export const SIGNAL_SCORE_PERCENTILES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
export type SignalScorePercentile = (typeof SIGNAL_SCORE_PERCENTILES)[number];

// Raw TB row from `health_score_report_signal_scores`: one row per signal, one column per
// percentile band (p10_pct .. p100_pct).
export interface HealthScoreCoverageSignalScoreRow {
  signal_key: string;
  category_key: string;
  p10_pct: number;
  p20_pct: number;
  p30_pct: number;
  p40_pct: number;
  p50_pct: number;
  p60_pct: number;
  p70_pct: number;
  p80_pct: number;
  p90_pct: number;
  p100_pct: number;
  repos: number;
}

// One signal's full percentile-band distribution, ready for the heatmap.
export interface HealthScoreCoverageSignalScore {
  signalKey: string;
  categoryKey: string;
  percentiles: Record<SignalScorePercentile, number>;
  repos: number;
}

export interface HealthScoreCoverageSignalScoresData {
  signals: HealthScoreCoverageSignalScore[];
}
