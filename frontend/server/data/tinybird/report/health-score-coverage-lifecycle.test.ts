// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mapHealthScoreCoverageLifecycleRows } from './health-score-coverage-lifecycle';
import type { HealthScoreCoverageLifecycleRow } from '~~/types/report/health-score-coverage-lifecycle.types';

describe('mapHealthScoreCoverageLifecycleRows', () => {
  test('maps the NULL label to "unavailable" and sorts by project count descending', () => {
    const rows: HealthScoreCoverageLifecycleRow[] = [
      { label: 'stable', projects: 306 },
      { label: 'active', projects: 9758 },
      { label: null, projects: 366 },
      { label: 'declining', projects: 488 },
    ];

    const result = mapHealthScoreCoverageLifecycleRows(rows);

    expect(result.rows).toEqual([
      { label: 'active', projects: 9758 },
      { label: 'declining', projects: 488 },
      { label: 'unavailable', projects: 366 },
      { label: 'stable', projects: 306 },
    ]);
    expect(result.total).toBe(10918);
  });

  test('returns an empty result for an empty response', () => {
    const result = mapHealthScoreCoverageLifecycleRows([]);

    expect(result.rows).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe('fetchHealthScoreCoverageLifecycle', () => {
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

  test('fetches the pipe with the given scope and maps the rows', async () => {
    const { fetchHealthScoreCoverageLifecycle } = await import('./health-score-coverage-lifecycle');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [{ label: 'active', projects: 1097 }],
    });

    const result = await fetchHealthScoreCoverageLifecycle('lf');

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_lifecycle.json',
      {
        scope: 'lf',
      },
    );
    expect(result.total).toBe(1097);
  });

  test('defaults to scope "all"', async () => {
    const { fetchHealthScoreCoverageLifecycle } = await import('./health-score-coverage-lifecycle');

    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    await fetchHealthScoreCoverageLifecycle();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_lifecycle.json',
      {
        scope: 'all',
      },
    );
  });
});
