// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';

const mockFetchFromTinybird = vi.fn();

describe('Health Score Coverage Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside health-score-coverage.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('maps the TB glance row to camelCase frontend data', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchHealthScoreCoverageGlance } =
      await import('~~/server/data/tinybird/report/health-score-coverage');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [
        {
          repos_tracked: 1200,
          repos_scored: 950,
          projects_tracked: 300,
          projects_scored: 280,
          projects_partial: 15,
          updated_at: '2026-09-08 03:00:03',
        },
      ],
    });

    const result = await fetchHealthScoreCoverageGlance();

    expect(result).toEqual({
      reposTracked: 1200,
      reposScored: 950,
      projectsTracked: 300,
      projectsScored: 280,
      projectsPartial: 15,
      updatedAt: '2026-09-08T03:00:03.000Z',
    });
  });

  test('throws when the pipe returns no rows', async () => {
    const { fetchHealthScoreCoverageGlance } =
      await import('~~/server/data/tinybird/report/health-score-coverage');

    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    await expect(fetchHealthScoreCoverageGlance()).rejects.toThrow(
      'No data returned from health_score_report_kpis',
    );
  });
});
