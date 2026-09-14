// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mapHealthScoreCoverageCategoryCoverageRow } from './health-score-coverage-category-coverage';
import type { HealthScoreCoverageCategoryCoverageRow } from '~~/types/report/health-score-coverage-category-coverage.types';

describe('mapHealthScoreCoverageCategoryCoverageRow', () => {
  test('maps the single row into the fixed 3-category order', () => {
    const row: HealthScoreCoverageCategoryCoverageRow = {
      maintainer_health_scored: 20665,
      development_activity_scored: 19908,
      security_supply_chain_scored: 12284,
      repos_tracked: 31593,
    };

    const result = mapHealthScoreCoverageCategoryCoverageRow(row);

    expect(result).toEqual({
      categories: [
        { categoryKey: 'maintainerHealth', scored: 20665 },
        { categoryKey: 'developmentActivity', scored: 19908 },
        { categoryKey: 'securitySupplyChain', scored: 12284 },
      ],
      reposTracked: 31593,
    });
  });

  test('defaults every field to 0 when the pipe returns no row', () => {
    const result = mapHealthScoreCoverageCategoryCoverageRow(undefined);

    expect(result).toEqual({
      categories: [
        { categoryKey: 'maintainerHealth', scored: 0 },
        { categoryKey: 'developmentActivity', scored: 0 },
        { categoryKey: 'securitySupplyChain', scored: 0 },
      ],
      reposTracked: 0,
    });
  });
});

describe('fetchHealthScoreCoverageCategoryCoverage', () => {
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
    const { fetchHealthScoreCoverageCategoryCoverage } =
      await import('./health-score-coverage-category-coverage');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [
        {
          maintainer_health_scored: 20665,
          development_activity_scored: 19908,
          security_supply_chain_scored: 12284,
          repos_tracked: 31593,
        },
      ],
    });

    const result = await fetchHealthScoreCoverageCategoryCoverage();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_category_coverage.json',
      {},
    );
    expect(result.reposTracked).toBe(31593);
    expect(result.categories).toHaveLength(3);
  });

  test('maps an empty response to all-zero categories', async () => {
    const { fetchHealthScoreCoverageCategoryCoverage } =
      await import('./health-score-coverage-category-coverage');

    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    const result = await fetchHealthScoreCoverageCategoryCoverage();

    expect(result.reposTracked).toBe(0);
    expect(result.categories.every((category) => category.scored === 0)).toBe(true);
  });
});
