// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "Repositories we can score, by category" widget (IN-1289).
// Kept out of the shared server/data/tinybird/report/health-score-coverage.ts file for the same
// merge-order reason as the types file next to it - see
// health-score-coverage-category-coverage.types.ts.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageCategoryCount,
  HealthScoreCoverageCategoryCoverageData,
  HealthScoreCoverageCategoryCoverageRow,
} from '~~/types/report/health-score-coverage-category-coverage.types';

/**
 * Maps the raw `health_score_report_category_coverage` single-row response into the fixed
 * 3-category shape the chart consumes, in the design's display order: maintainer health,
 * development activity, security & supply chain.
 */
export function mapHealthScoreCoverageCategoryCoverageRow(
  row: HealthScoreCoverageCategoryCoverageRow | undefined,
): HealthScoreCoverageCategoryCoverageData {
  const categories: HealthScoreCoverageCategoryCount[] = [
    { categoryKey: 'maintainerHealth', scored: row?.maintainer_health_scored ?? 0 },
    { categoryKey: 'developmentActivity', scored: row?.development_activity_scored ?? 0 },
    { categoryKey: 'securitySupplyChain', scored: row?.security_supply_chain_scored ?? 0 },
  ];

  return {
    categories,
    reposTracked: row?.repos_tracked ?? 0,
  };
}

export async function fetchHealthScoreCoverageCategoryCoverage(): Promise<HealthScoreCoverageCategoryCoverageData> {
  const result = await fetchFromTinybird<HealthScoreCoverageCategoryCoverageRow[]>(
    '/v0/pipes/health_score_report_category_coverage.json',
    {},
  );

  return mapHealthScoreCoverageCategoryCoverageRow(result.data[0]);
}
