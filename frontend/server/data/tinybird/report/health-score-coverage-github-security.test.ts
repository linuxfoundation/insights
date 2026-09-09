// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mapHealthScoreCoverageGithubSecurityRows } from './health-score-coverage-github-security';
import type { HealthScoreCoverageGithubSecurityRow } from '~~/types/report/health-score-coverage-github-security.types';

describe('mapHealthScoreCoverageGithubSecurityRows', () => {
  test('maps both isLF rows into the fixed funnel stages with per-column share', () => {
    const rows: HealthScoreCoverageGithubSecurityRow[] = [
      {
        isLF: 0,
        tracked: 11712,
        health_published: 10758,
        security_scored: 7756,
        scorecard_scanned: 5901,
        lf_non_github: 2632,
      },
      {
        isLF: 1,
        tracked: 17231,
        health_published: 8192,
        security_scored: 4515,
        scorecard_scanned: 1942,
        lf_non_github: 2632,
      },
    ];

    const result = mapHealthScoreCoverageGithubSecurityRows(rows);

    expect(result.stages).toEqual([
      {
        stage: 'tracked',
        label: 'Tracked in Insights',
        lf: 17231,
        lfSharePct: 100,
        other: 11712,
        otherSharePct: 100,
      },
      {
        stage: 'healthPublished',
        label: 'Health score published',
        lf: 8192,
        lfSharePct: 47.5,
        other: 10758,
        otherSharePct: 91.9,
      },
      {
        stage: 'securityScored',
        label: 'Security category scored',
        lf: 4515,
        lfSharePct: 26.2,
        other: 7756,
        otherSharePct: 66.2,
      },
      {
        stage: 'scorecardScanned',
        label: 'Scanned by Scorecard',
        lf: 1942,
        lfSharePct: 11.3,
        other: 5901,
        otherSharePct: 50.4,
      },
    ]);
    expect(result.lfNonGithub).toBe(2632);
  });

  test('funnel is monotonically decreasing in both columns', () => {
    const rows: HealthScoreCoverageGithubSecurityRow[] = [
      {
        isLF: 0,
        tracked: 11712,
        health_published: 10758,
        security_scored: 7756,
        scorecard_scanned: 5901,
        lf_non_github: 2632,
      },
      {
        isLF: 1,
        tracked: 17231,
        health_published: 8192,
        security_scored: 4515,
        scorecard_scanned: 1942,
        lf_non_github: 2632,
      },
    ];

    const { stages } = mapHealthScoreCoverageGithubSecurityRows(rows);

    for (let i = 1; i < stages.length; i += 1) {
      expect(stages[i]!.lf).toBeLessThanOrEqual(stages[i - 1]!.lf);
      expect(stages[i]!.other).toBeLessThanOrEqual(stages[i - 1]!.other);
    }
  });

  test('returns zeroed stages and lfNonGithub for an empty response', () => {
    const result = mapHealthScoreCoverageGithubSecurityRows([]);

    expect(result.stages.every((s) => s.lf === 0 && s.other === 0)).toBe(true);
    expect(result.lfNonGithub).toBe(0);
  });
});

describe('fetchHealthScoreCoverageGithubSecurity', () => {
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
    const { fetchHealthScoreCoverageGithubSecurity } =
      await import('./health-score-coverage-github-security');

    mockFetchFromTinybird.mockResolvedValueOnce({
      data: [
        {
          isLF: 0,
          tracked: 100,
          health_published: 80,
          security_scored: 60,
          scorecard_scanned: 40,
          lf_non_github: 5,
        },
        {
          isLF: 1,
          tracked: 200,
          health_published: 150,
          security_scored: 100,
          scorecard_scanned: 50,
          lf_non_github: 5,
        },
      ],
    });

    const result = await fetchHealthScoreCoverageGithubSecurity();

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/health_score_report_github_security.json',
      {},
    );
    expect(result.stages).toHaveLength(4);
    expect(result.lfNonGithub).toBe(5);
  });
});
