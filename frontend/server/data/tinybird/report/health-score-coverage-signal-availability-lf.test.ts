// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { combineHealthScoreCoverageSignalAvailabilityLfRows } from './health-score-coverage-signal-availability-lf';
import type { HealthScoreCoverageSignalAvailabilityLfRow } from '~~/types/report/health-score-coverage-signal-availability-lf.types';

describe('combineHealthScoreCoverageSignalAvailabilityLfRows', () => {
  test('pairs lf and other rows by signal_key', () => {
    const lfRows: HealthScoreCoverageSignalAvailabilityLfRow[] = [
      {
        signal_key: 'busFactor',
        category_key: 'maintainerHealth',
        available_pct: 41.0,
        repos_available: 434,
        repos_tracked: 1097,
      },
      {
        signal_key: 'scorecard',
        category_key: 'securitySupplyChain',
        available_pct: 9.8,
        repos_available: 107,
        repos_tracked: 1097,
      },
    ];
    const otherRows: HealthScoreCoverageSignalAvailabilityLfRow[] = [
      {
        signal_key: 'busFactor',
        category_key: 'maintainerHealth',
        available_pct: 82.3,
        repos_available: 8675,
        repos_tracked: 10541,
      },
      {
        signal_key: 'scorecard',
        category_key: 'securitySupplyChain',
        available_pct: 50.5,
        repos_available: 5323,
        repos_tracked: 10541,
      },
    ];

    const result = combineHealthScoreCoverageSignalAvailabilityLfRows(lfRows, otherRows);

    expect(result).toEqual({
      signals: [
        {
          signalKey: 'busFactor',
          categoryKey: 'maintainerHealth',
          lf: { availablePct: 41.0, reposAvailable: 434, reposTracked: 1097 },
          other: { availablePct: 82.3, reposAvailable: 8675, reposTracked: 10541 },
        },
        {
          signalKey: 'scorecard',
          categoryKey: 'securitySupplyChain',
          lf: { availablePct: 9.8, reposAvailable: 107, reposTracked: 1097 },
          other: { availablePct: 50.5, reposAvailable: 5323, reposTracked: 10541 },
        },
      ],
      lfReposTracked: 1097,
      otherReposTracked: 10541,
    });
  });

  test('drops a signal present in lf rows but missing from other rows', () => {
    const lfRows: HealthScoreCoverageSignalAvailabilityLfRow[] = [
      {
        signal_key: 'busFactor',
        category_key: 'maintainerHealth',
        available_pct: 41.0,
        repos_available: 434,
        repos_tracked: 1097,
      },
    ];

    const result = combineHealthScoreCoverageSignalAvailabilityLfRows(lfRows, []);

    expect(result.signals).toEqual([]);
    expect(result.lfReposTracked).toBe(1097);
    expect(result.otherReposTracked).toBe(0);
  });

  test('returns an empty result for empty responses', () => {
    const result = combineHealthScoreCoverageSignalAvailabilityLfRows([], []);

    expect(result).toEqual({ signals: [], lfReposTracked: 0, otherReposTracked: 0 });
  });
});

describe('fetchHealthScoreCoverageSignalAvailabilityLf', () => {
  const mockFetchFromTinybird = vi.fn();

  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // vi.doMock is not hoisted, and the top-level `import` of this module above (for the
    // combine-function tests) already cached a copy wired to the real '../tinybird'. Reset the
    // module registry so the dynamic re-import below picks up the mock.
    vi.resetModules();
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('fetches the pipe for both scopes and combines the rows', async () => {
    const { fetchHealthScoreCoverageSignalAvailabilityLf } =
      await import('./health-score-coverage-signal-availability-lf');

    mockFetchFromTinybird
      .mockResolvedValueOnce({
        data: [
          {
            signal_key: 'busFactor',
            category_key: 'maintainerHealth',
            available_pct: 41.0,
            repos_available: 434,
            repos_tracked: 1097,
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            signal_key: 'busFactor',
            category_key: 'maintainerHealth',
            available_pct: 82.3,
            repos_available: 8675,
            repos_tracked: 10541,
          },
        ],
      });

    const result = await fetchHealthScoreCoverageSignalAvailabilityLf();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_signal_availability.json',
      { scope: 'lf' },
    );
    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_signal_availability.json',
      { scope: 'other' },
    );
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0]?.signalKey).toBe('busFactor');
    expect(result.lfReposTracked).toBe(1097);
    expect(result.otherReposTracked).toBe(10541);
  });
});
