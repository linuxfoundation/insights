// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mapHealthScoreCoverageBandsRows } from './health-score-coverage-bands';
import type { HealthScoreCoverageBandsRow } from '~~/types/report/health-score-coverage-bands.types';

describe('mapHealthScoreCoverageBandsRows', () => {
  test('splits full (covered=3) and partial (covered=2) counts per band', () => {
    const rows: HealthScoreCoverageBandsRow[] = [
      { band: 'excellent', covered: 3, projects: 120 },
      { band: 'excellent', covered: 2, projects: 10 },
      { band: 'healthy', covered: 3, projects: 80 },
    ];

    const result = mapHealthScoreCoverageBandsRows(rows);

    expect(result.bands).toEqual([
      { band: 'excellent', full: 120, partial: 10 },
      { band: 'healthy', full: 80, partial: 0 },
      { band: 'fair', full: 0, partial: 0 },
      { band: 'concerning', full: 0, partial: 0 },
      { band: 'critical', full: 0, partial: 0 },
    ]);
    expect(result.fullTotal).toBe(200);
    expect(result.partialTotal).toBe(10);
  });

  test('fills bands missing from the pipe response with 0', () => {
    const rows: HealthScoreCoverageBandsRow[] = [{ band: 'critical', covered: 3, projects: 5 }];

    const result = mapHealthScoreCoverageBandsRows(rows);

    expect(result.bands.map((band) => band.band)).toEqual([
      'excellent',
      'healthy',
      'fair',
      'concerning',
      'critical',
    ]);
    expect(result.bands.find((band) => band.band === 'critical')).toEqual({
      band: 'critical',
      full: 5,
      partial: 0,
    });
    expect(result.fullTotal).toBe(5);
    expect(result.partialTotal).toBe(0);
  });

  test('ignores an unrecognized band', () => {
    const rows: HealthScoreCoverageBandsRow[] = [{ band: 'unknown', covered: 3, projects: 5 }];

    const result = mapHealthScoreCoverageBandsRows(rows);

    expect(result.fullTotal).toBe(0);
    expect(result.partialTotal).toBe(0);
  });

  test('returns all-zero bands for an empty response', () => {
    const result = mapHealthScoreCoverageBandsRows([]);

    expect(result.bands).toHaveLength(5);
    expect(result.bands.every((band) => band.full === 0 && band.partial === 0)).toBe(true);
  });
});

describe('fetchHealthScoreCoverageBands', () => {
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
    const { fetchHealthScoreCoverageBands } = await import('./health-score-coverage-bands');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [{ band: 'excellent', covered: 3, projects: 120 }],
    });

    const result = await fetchHealthScoreCoverageBands('lf');

    expect(mockFetchFromTinybird).toHaveBeenCalledWith('/v0/pipes/health_score_report_bands.json', {
      scope: 'lf',
    });
    expect(result.fullTotal).toBe(120);
  });

  test('defaults to scope "all"', async () => {
    const { fetchHealthScoreCoverageBands } = await import('./health-score-coverage-bands');

    mockFetchFromTinybird.mockResolvedValueOnce({ data: [] });

    await fetchHealthScoreCoverageBands();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith('/v0/pipes/health_score_report_bands.json', {
      scope: 'all',
    });
  });
});
