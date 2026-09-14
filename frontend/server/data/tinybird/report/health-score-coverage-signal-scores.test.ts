// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mapHealthScoreCoverageSignalScoreRows } from './health-score-coverage-signal-scores';
import type { HealthScoreCoverageSignalScoreRow } from '~~/types/report/health-score-coverage-signal-scores.types';

describe('mapHealthScoreCoverageSignalScoreRows', () => {
  test('maps raw rows to camelCase, preserving order', () => {
    const rows: HealthScoreCoverageSignalScoreRow[] = [
      {
        signal_key: 'busFactor',
        category_key: 'maintainerHealth',
        p80_pct: 72.2,
        median_pct: 38.9,
        repos: 17776,
      },
      {
        signal_key: 'scorecard',
        category_key: 'securitySupplyChain',
        p80_pct: 62.5,
        median_pct: 50.0,
        repos: 7843,
      },
    ];

    const result = mapHealthScoreCoverageSignalScoreRows(rows);

    expect(result.signals).toEqual([
      {
        signalKey: 'busFactor',
        categoryKey: 'maintainerHealth',
        p80Pct: 72.2,
        medianPct: 38.9,
        repos: 17776,
      },
      {
        signalKey: 'scorecard',
        categoryKey: 'securitySupplyChain',
        p80Pct: 62.5,
        medianPct: 50.0,
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
          p80_pct: 72.2,
          median_pct: 38.9,
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
