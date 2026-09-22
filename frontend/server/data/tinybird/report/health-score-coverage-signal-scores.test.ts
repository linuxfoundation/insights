// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';

import type { HealthScoreCoverageSignalScoreRow } from '~~/types/report/health-score-coverage-signal-scores.types';

import { mapHealthScoreCoverageSignalScoreRows } from './health-score-coverage-signal-scores';

describe('mapHealthScoreCoverageSignalScoreRows', () => {
  test('maps raw rows to camelCase, preserving order', () => {
    const rows: HealthScoreCoverageSignalScoreRow[] = [
      {
        signal_key: 'busFactor',
        category_key: 'maintainerHealth',
        p10_pct: 10.1,
        p20_pct: 20.2,
        p30_pct: 30.3,
        p40_pct: 40.4,
        p50_pct: 50.5,
        p60_pct: 60.6,
        p70_pct: 70.7,
        p80_pct: 72.2,
        p90_pct: 90.9,
        p100_pct: 100,
        repos: 17776,
      },
      {
        signal_key: 'scorecard',
        category_key: 'securitySupplyChain',
        p10_pct: 5,
        p20_pct: 15,
        p30_pct: 25,
        p40_pct: 35,
        p50_pct: 50.0,
        p60_pct: 55,
        p70_pct: 60,
        p80_pct: 62.5,
        p90_pct: 80,
        p100_pct: 100,
        repos: 7843,
      },
    ];

    const result = mapHealthScoreCoverageSignalScoreRows(rows);

    expect(result.signals).toEqual([
      {
        signalKey: 'busFactor',
        categoryKey: 'maintainerHealth',
        percentiles: {
          10: 10.1,
          20: 20.2,
          30: 30.3,
          40: 40.4,
          50: 50.5,
          60: 60.6,
          70: 70.7,
          80: 72.2,
          90: 90.9,
          100: 100,
        },
        repos: 17776,
      },
      {
        signalKey: 'scorecard',
        categoryKey: 'securitySupplyChain',
        percentiles: {
          10: 5,
          20: 15,
          30: 25,
          40: 35,
          50: 50.0,
          60: 55,
          70: 60,
          80: 62.5,
          90: 80,
          100: 100,
        },
        repos: 7843,
      },
    ]);
  });

  test('returns an empty result for an empty response', () => {
    const result = mapHealthScoreCoverageSignalScoreRows([]);

    expect(result.signals).toEqual([]);
  });
});

describe('fetchHealthScoreCoverageSignalScores', () => {
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

  test('fetches the pipe with no params and maps the rows', async () => {
    const { fetchHealthScoreCoverageSignalScores } =
      await import('./health-score-coverage-signal-scores');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [
        {
          signal_key: 'busFactor',
          category_key: 'maintainerHealth',
          p10_pct: 10,
          p20_pct: 20,
          p30_pct: 30,
          p40_pct: 40,
          p50_pct: 50,
          p60_pct: 60,
          p70_pct: 70,
          p80_pct: 72.2,
          p90_pct: 90,
          p100_pct: 100,
          repos: 17776,
        },
      ],
    });

    const result = await fetchHealthScoreCoverageSignalScores();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_signal_scores.json',
      {},
    );
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0]?.signalKey).toBe('busFactor');
  });
});
