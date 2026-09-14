// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Security coverage on GitHub-hosted repositories" widget (IN-1293,
// widget 08 of the Health Score Coverage report, epic IN-1276). Kept in its own file rather than
// the shared types/report/health-score-coverage.types.ts because that file is edited sequentially
// by each widget ticket in merge order, and it isn't IN-1293's turn yet (IN-1285's insights PR
// #2164, IN-1286's insights PR #2165, IN-1287's insights PR #2166 and IN-1290's insights PR #2167
// are still open). Will be merged into the shared types file in a follow-up.

// Raw TB row from `health_score_report_github_security`: one row per `isLF` value (0 = Other,
// 1 = Linux Foundation). `lf_non_github` is the same value repeated on every row.
export interface HealthScoreCoverageGithubSecurityRow {
  isLF: 0 | 1;
  tracked: number;
  health_published: number;
  security_scored: number;
  scorecard_scanned: number;
  lf_non_github: number;
}

export type HealthScoreCoverageGithubSecurityStageKey =
  'tracked' | 'healthPublished' | 'securityScored' | 'scorecardScanned';

// One funnel stage, ready for the table. Stages are monotonically decreasing (each stage's `lf`
// and `other` are <= the previous stage's) per the pipe's DESCRIPTION.
export interface HealthScoreCoverageGithubSecurityStageCount {
  stage: HealthScoreCoverageGithubSecurityStageKey;
  label: string;
  lf: number;
  lfSharePct: number;
  other: number;
  otherSharePct: number;
}

export interface HealthScoreCoverageGithubSecurityData {
  stages: HealthScoreCoverageGithubSecurityStageCount[];
  // LF-affiliated tracked repos NOT hosted on GitHub, for the widget's footnote. Reused by
  // IN-1291's widget 06 legend per the pipe's DESCRIPTION.
  lfNonGithub: number;
}
