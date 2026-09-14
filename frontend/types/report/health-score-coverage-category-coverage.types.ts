// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Repositories we can score, by category" widget (IN-1289, widget 04 of
// the Health Score Coverage report, epic IN-1276). Kept in its own file rather than the shared
// types/report/health-score-coverage.types.ts because that file is edited sequentially by each
// widget ticket in merge order, and it isn't IN-1289's turn yet. Will be merged into the shared
// types file in a follow-up.

// Raw TB row from `health_score_report_category_coverage`: a single row, one column per category
// plus the shared denominator.
export interface HealthScoreCoverageCategoryCoverageRow {
  maintainer_health_scored: number;
  development_activity_scored: number;
  security_supply_chain_scored: number;
  repos_tracked: number;
}

// One category's scored-repo count, keyed to match the pipe's column names minus the `_scored`
// suffix. Display order is fixed per the design: maintainerHealth, developmentActivity,
// securitySupplyChain.
export interface HealthScoreCoverageCategoryCount {
  categoryKey: 'maintainerHealth' | 'developmentActivity' | 'securitySupplyChain';
  scored: number;
}

export interface HealthScoreCoverageCategoryCoverageData {
  categories: HealthScoreCoverageCategoryCount[];
  reposTracked: number;
}
