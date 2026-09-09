// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mapHealthScoreCoverageCategoryMaximumRow } from './health-score-coverage-category-maximum';
import type { HealthScoreCoverageCategoryMaximumRow } from '~~/types/report/health-score-coverage-category-maximum.types';

describe('mapHealthScoreCoverageCategoryMaximumRow', () => {
  test('maps the single row into the fixed 3-category order with label and maximum', () => {
    const row: HealthScoreCoverageCategoryMaximumRow = {
      maintainer_health_max: 4679,
      development_activity_max: 1442,
      security_supply_chain_max: 135,
      repos_tracked: 31593,
    };

    const result = mapHealthScoreCoverageCategoryMaximumRow(row);

    expect(result).toEqual({
      categories: [
        {
          categoryKey: 'maintainerHealth',
          label: 'Maintainer health',
          maximum: 40,
          reposAtMaximum: 4679,
        },
        {
          categoryKey: 'developmentActivity',
          label: 'Development activity',
          maximum: 25,
          reposAtMaximum: 1442,
        },
        {
          categoryKey: 'securitySupplyChain',
          label: 'Security & supply chain',
          maximum: 35,
          reposAtMaximum: 135,
        },
      ],
      reposTracked: 31593,
    });
  });

  test('defaults every count to 0 when the pipe returns no row', () => {
    const result = mapHealthScoreCoverageCategoryMaximumRow(undefined);

    expect(result).toEqual({
      categories: [
        {
          categoryKey: 'maintainerHealth',
          label: 'Maintainer health',
          maximum: 40,
          reposAtMaximum: 0,
        },
        {
          categoryKey: 'developmentActivity',
          label: 'Development activity',
          maximum: 25,
          reposAtMaximum: 0,
        },
        {
          categoryKey: 'securitySupplyChain',
          label: 'Security & supply chain',
          maximum: 35,
          reposAtMaximum: 0,
        },
      ],
      reposTracked: 0,
    });
  });
});

describe('fetchHealthScoreCoverageCategoryMaximum', () => {
  const mockFetchFromTinybird = vi.fn();

  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // vi.doMock is not hoisted, and the top-level `import` of this module above (for the mapper
    // tests) already cached a copy wired to the real '../tinybird'. Reset the module registry so
    // the dynamic re-import below picks up the mock.
    vi.resetModules();
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('fetches the pipe with no params and maps the row', async () => {
    const { fetchHealthScoreCoverageCategoryMaximum } =
      await import('./health-score-coverage-category-maximum');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [
        {
          maintainer_health_max: 4679,
          development_activity_max: 1442,
          security_supply_chain_max: 135,
          repos_tracked: 31593,
        },
      ],
    });

    const result = await fetchHealthScoreCoverageCategoryMaximum();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_category_maximum.json',
      {},
    );
    expect(result.reposTracked).toBe(31593);
    expect(result.categories).toHaveLength(3);
  });

  test('maps an empty response to all-zero counts', async () => {
    const { fetchHealthScoreCoverageCategoryMaximum } =
      await import('./health-score-coverage-category-maximum');

    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    const result = await fetchHealthScoreCoverageCategoryMaximum();

    expect(result.reposTracked).toBe(0);
    expect(result.categories.every((category) => category.reposAtMaximum === 0)).toBe(true);
  });
});
