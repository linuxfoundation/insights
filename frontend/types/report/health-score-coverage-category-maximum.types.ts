// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone types for the "Repositories scoring full marks" widget (IN-1292, widget 07 of the
// Health Score Coverage report, epic IN-1276). Kept in its own file rather than the shared
// types/report/health-score-coverage.types.ts because that file is edited sequentially by each
// widget ticket in merge order, and it isn't IN-1292's turn yet. Will be merged into the shared
// types file in a follow-up.

// Raw TB row from `health_score_report_category_maximum`: a single row, one column per category
// plus the shared denominator.
export interface HealthScoreCoverageCategoryMaximumRow {
  maintainer_health_max: number;
  development_activity_max: number;
  security_supply_chain_max: number;
  repos_tracked: number;
}

// Display order is fixed per the design: maintainerHealth, developmentActivity,
// securitySupplyChain.
export type HealthScoreCoverageCategoryMaximumCategoryKey =
  'maintainerHealth' | 'developmentActivity' | 'securitySupplyChain';

// One category's row for the table: its exact-maximum score and how many tracked repos hit it.
export interface HealthScoreCoverageCategoryMaximumCount {
  categoryKey: HealthScoreCoverageCategoryMaximumCategoryKey;
  label: string;
  maximum: number;
  reposAtMaximum: number;
}

export interface HealthScoreCoverageCategoryMaximumData {
  categories: HealthScoreCoverageCategoryMaximumCount[];
  reposTracked: number;
}
