// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Where the strongest repositories pull ahead" widget (IN-1288, widget
// 03 of the Health Score Coverage report, epic IN-1276). Kept in its own file rather than the
// shared types/report/health-score-coverage.types.ts because that file is edited sequentially by
// each widget ticket in merge order, and it isn't IN-1288's turn yet. Will be merged into the
// shared types file in a follow-up.

// Raw TB row from `health_score_report_signal_scores`: one row per signal.
export interface HealthScoreCoverageSignalScoreRow {
  signal_key: string;
  category_key: string;
  p80_pct: number;
  median_pct: number;
  repos: number;
}

// One signal's top-20%/median scores, ready for the chart.
export interface HealthScoreCoverageSignalScore {
  signalKey: string;
  categoryKey: string;
  p80Pct: number;
  medianPct: number;
  repos: number;
}

export interface HealthScoreCoverageSignalScoresData {
  signals: HealthScoreCoverageSignalScore[];
}
