// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { callsTo, mockFetch, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/overview/badges';
const pipePath = '/v0/pipes/leaderboards.json';

const row = (leaderboardType: string, rank: number, totalCount: number) => ({
  rank,
  id: 'id-1',
  slug: 'kubernetes',
  name: 'Kubernetes',
  leaderboardType,
  value: 123,
  previousPeriodValue: 100,
  totalCount,
});

let rows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  rows = [row('stars', 5, 1000)];
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return rows;
    }),
  );
});

const badgesOf = async () => (await get(route)).json().data;

describe('Tinybird call (AC1)', () => {
  it('asks the pipe once for the project with an explicit pageSize', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(callsTo(pipePath)).toHaveLength(1);
    const [call] = callsTo(pipePath);
    expect(call?.searchParams.get('slug')).toBe('kubernetes');
    expect(call?.searchParams.get('pageSize')).toBe('100');
  });
});

describe('badges (AC2, AC4)', () => {
  it('returns the type, tier, rank, total and rounded-up percentile', async () => {
    rows = [row('stars', 5, 1000)];
    expect(await badgesOf()).toEqual([
      { leaderboardType: 'stars', tier: 'black', rank: 5, totalCount: 1000, percentile: 1 },
    ]);
  });

  it.each([
    [10, 'black', 1],
    [11, 'gold', 2],
    [100, 'gold', 10],
    [101, 'silver', 11],
    [250, 'silver', 25],
    [251, 'bronze', 26],
    [500, 'bronze', 50],
  ])('rank %i of 1000 earns %s at percentile %i', async (rank, tier, percentile) => {
    rows = [row('forks', rank, 1000)];
    expect(await badgesOf()).toEqual([
      { leaderboardType: 'forks', tier, rank, totalCount: 1000, percentile },
    ]);
  });

  it('picks the tier from the unrounded share', async () => {
    rows = [row('forks', 1, 99)];
    expect(await badgesOf()).toMatchObject([{ tier: 'gold', percentile: 2 }]);
  });

  it('leaves out rows past the top 50%, rows without a total and types without a badge', async () => {
    rows = [
      row('stars', 501, 1000),
      row('forks', 1, 0),
      row('focused-teams', 1, 1000),
      row('contributors', 1, 1000),
      row('commit-activity', 1, 1000),
    ];
    expect((await badgesOf()).map((b: { leaderboardType: string }) => b.leaderboardType)).toEqual([
      'commit-activity',
    ]);
  });

  it('covers the nine badge types', async () => {
    const types = [
      'active-contributors',
      'active-organizations',
      'codebase-size',
      'commit-activity',
      'fastest-mergers',
      'fastest-responders',
      'forks',
      'package-downloads',
      'stars',
    ];
    rows = types.map((type) => row(type, 1, 1000));
    expect((await badgesOf()).map((b: { leaderboardType: string }) => b.leaderboardType)).toEqual(
      types,
    );
  });
});

describe('order (AC3)', () => {
  it('sorts by tier, then percentile, then type', async () => {
    rows = [
      row('stars', 400, 1000),
      row('forks', 30, 1000),
      row('codebase-size', 50, 1000),
      row('active-contributors', 50, 1000),
      row('commit-activity', 1, 1000),
    ];
    expect((await badgesOf()).map((b: { leaderboardType: string }) => b.leaderboardType)).toEqual([
      'commit-activity',
      'forks',
      'active-contributors',
      'codebase-size',
      'stars',
    ]);
  });
});

describe('row guard (AC5)', () => {
  it.each([
    ['a type that is not a string', { ...row('stars', 1, 10), leaderboardType: 7 }],
    ['a negative rank', row('stars', -1, 10)],
    ['a fractional rank', row('stars', 1.5, 10)],
    ['a missing totalCount', { ...row('stars', 1, 10), totalCount: undefined }],
  ])('answers 503 for %s', async (_label, bad) => {
    rows = [bad];
    expect((await get(route)).statusCode).toBe(503);
  });
});

describe('unknown project (AC6)', () => {
  it('answers an empty list without calling the pipe', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => rows, []));
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    expect(callsTo(pipePath)).toHaveLength(0);
  });
});
