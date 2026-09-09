// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "Repositories scoring full marks" widget (IN-1292). Kept out of
// the shared server/data/tinybird/report/health-score-coverage.ts file for the same merge-order
// reason as the types file next to it - see health-score-coverage-category-maximum.types.ts.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageCategoryMaximumCategoryKey,
  HealthScoreCoverageCategoryMaximumCount,
  HealthScoreCoverageCategoryMaximumData,
  HealthScoreCoverageCategoryMaximumRow,
} from '~~/types/report/health-score-coverage-category-maximum.types';

// Fixed category order, label and exact-maximum score per the design copy. The maximum values
// (40 / 25 / 35) are the pipe's own thresholds (`countIf(... = 40)` etc.), not derived from the
// response, so they are declared here rather than read off a row.
const CATEGORY_ORDER: {
  categoryKey: HealthScoreCoverageCategoryMaximumCategoryKey;
  label: string;
  maximum: number;
  key: keyof Pick<
    HealthScoreCoverageCategoryMaximumRow,
    'maintainer_health_max' | 'development_activity_max' | 'security_supply_chain_max'
  >;
}[] = [
  {
    categoryKey: 'maintainerHealth',
    label: 'Maintainer health',
    maximum: 40,
    key: 'maintainer_health_max',
  },
  {
    categoryKey: 'developmentActivity',
    label: 'Development activity',
    maximum: 25,
    key: 'development_activity_max',
  },
  {
    categoryKey: 'securitySupplyChain',
    label: 'Security & supply chain',
    maximum: 35,
    key: 'security_supply_chain_max',
  },
];

/**
 * Maps the raw `health_score_report_category_maximum` single-row response into the fixed
 * 3-category shape the table consumes, in the design's display order: maintainer health,
 * development activity, security & supply chain.
 */
export function mapHealthScoreCoverageCategoryMaximumRow(
  row: HealthScoreCoverageCategoryMaximumRow | undefined,
): HealthScoreCoverageCategoryMaximumData {
  const categories: HealthScoreCoverageCategoryMaximumCount[] = CATEGORY_ORDER.map(
    ({ categoryKey, label, maximum, key }) => ({
      categoryKey,
      label,
      maximum,
      reposAtMaximum: row?.[key] ?? 0,
    }),
  );

  return {
    categories,
    reposTracked: row?.repos_tracked ?? 0,
  };
}

export async function fetchHealthScoreCoverageCategoryMaximum(): Promise<HealthScoreCoverageCategoryMaximumData> {
  const result = await fetchFromTinybird<HealthScoreCoverageCategoryMaximumRow[]>(
    '/v0/pipes/health_score_report_category_maximum.json',
    {},
  );

  return mapHealthScoreCoverageCategoryMaximumRow(result.data[0]);
}
