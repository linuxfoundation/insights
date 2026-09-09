// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mapHealthScoreCoverageSignalAvailabilityRows } from './health-score-coverage-signal-availability';
import type { HealthScoreCoverageSignalAvailabilityRow } from '~~/types/report/health-score-coverage-signal-availability.types';

describe('mapHealthScoreCoverageSignalAvailabilityRows', () => {
  test('maps raw rows to camelCase and sorts by availablePct descending', () => {
    const rows: HealthScoreCoverageSignalAvailabilityRow[] = [
      {
        signal_key: 'releaseCadence',
        category_key: 'developmentActivity',
        available_pct: 14.2,
        repos_available: 4486,
        repos_tracked: 31593,
      },
      {
        signal_key: 'responsiveness',
        category_key: 'maintainerHealth',
        available_pct: 82.5,
        repos_available: 26054,
        repos_tracked: 31593,
      },
    ];

    const result = mapHealthScoreCoverageSignalAvailabilityRows(rows);

    expect(result.signals).toEqual([
      {
        signalKey: 'responsiveness',
        categoryKey: 'maintainerHealth',
        availablePct: 82.5,
        reposAvailable: 26054,
        reposTracked: 31593,
      },
      {
        signalKey: 'releaseCadence',
        categoryKey: 'developmentActivity',
        availablePct: 14.2,
        reposAvailable: 4486,
        reposTracked: 31593,
      },
    ]);
  });

  test('returns an empty result for an empty response', () => {
    const result = mapHealthScoreCoverageSignalAvailabilityRows([]);

    expect(result.signals).toEqual([]);
  });
});

describe('fetchHealthScoreCoverageSignalAvailability', () => {
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
    const { fetchHealthScoreCoverageSignalAvailability } =
      await import('./health-score-coverage-signal-availability');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [
        {
          signal_key: 'busFactor',
          category_key: 'maintainerHealth',
          available_pct: 56.3,
          repos_available: 17776,
          repos_tracked: 31593,
        },
      ],
    });

    const result = await fetchHealthScoreCoverageSignalAvailability('lf');

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_signal_availability.json',
      { scope: 'lf' },
    );
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0]?.signalKey).toBe('busFactor');
  });

  test('defaults to scope "all"', async () => {
    const { fetchHealthScoreCoverageSignalAvailability } =
      await import('./health-score-coverage-signal-availability');

    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    await fetchHealthScoreCoverageSignalAvailability();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_signal_availability.json',
      { scope: 'all' },
    );
  });
});
