// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { leaderboardTypes, toEntry } from '../src/lib/leaderboards.js';
import { callsTo, mockFetch, pipeCalls, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/leaderboards';
const pipePath = '/v0/pipes/leaderboards.json';

const row = (leaderboardType: unknown, rank: number, id = `${leaderboardType}-${rank}`) => ({
  rank,
  id,
  segmentId: 'segment-1',
  name: `Entity ${id}`,
  slug: id,
  logoUrl: '',
  leaderboardType,
  value: 100 - rank,
  previousPeriodValue: 90 - rank,
  collectionsSlugs: ['private-one'],
  isLF: 0,
  githubHandleArray: [],
  status: 'active',
  totalCount: 1000,
});

let rows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  rows = [];
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return rows;
    }),
  );
});

interface Item {
  type: string;
  entries: unknown[];
}

const dataOf = async (query = '') => {
  const res = await get(`${route}${query}`);
  expect(res.statusCode).toBe(200);
  return res.json<{ data: Item[] }>().data;
};

describe('Tinybird call (AC1)', () => {
  it('asks the pipe once for the top 5 by default', async () => {
    await dataOf();
    expect(pipeCalls()).toHaveLength(1);
    expect(callsTo(pipePath)[0]?.searchParams.get('maxRank')).toBe('5');
  });

  it('passes top as maxRank', async () => {
    await dataOf('?top=20');
    expect(callsTo(pipePath)[0]?.searchParams.get('maxRank')).toBe('20');
  });
});

describe('top (AC2)', () => {
  it.each(['0', '21', '2.5', 'five'])(
    'answers 400 for top=%s before calling Tinybird',
    async (top) => {
      const res = await get(`${route}?top=${top}`);
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it('accepts top=1', async () => {
    await dataOf('?top=1');
    expect(callsTo(pipePath)[0]?.searchParams.get('maxRank')).toBe('1');
  });
});

describe('grouping (AC3, AC4)', () => {
  it('returns every type in catalog order with its catalog fields', async () => {
    const data = await dataOf();
    expect(data).toEqual(leaderboardTypes.map((entry) => ({ ...entry, entries: [] })));
  });

  it("groups each type's rows under it, mapped by toEntry in pipe order", async () => {
    rows = [row('stars', 1), row('contributors', 1), row('stars', 2), row('contributors', 2)];
    const data = await dataOf();
    const byType = Object.fromEntries(data.map((item) => [item.type, item.entries]));
    expect(byType.stars).toEqual([toEntry(row('stars', 1)), toEntry(row('stars', 2))]);
    expect(byType.contributors).toEqual([
      toEntry(row('contributors', 1)),
      toEntry(row('contributors', 2)),
    ]);
    expect(byType.forks).toEqual([]);
  });

  it('keeps tied ranks', async () => {
    rows = [row('forks', 1, 'a'), row('forks', 1, 'b')];
    const forks = (await dataOf('?top=1')).find((item) => item.type === 'forks');
    expect(forks?.entries).toHaveLength(2);
  });
});

describe('pipe rows (AC5)', () => {
  it('drops rows of a type outside the enum', async () => {
    rows = [row('brand-new-type', 1), row('stars', 1)];
    const data = await dataOf();
    expect(data.map((item) => item.type)).toEqual(leaderboardTypes.map((entry) => entry.type));
    expect(data.flatMap((item) => item.entries)).toEqual([toEntry(row('stars', 1))]);
  });

  it.each([
    ['a non-string leaderboardType', { ...row('stars', 1), leaderboardType: 7 }],
    ['a row failing the entry guard', { ...row('stars', 1), rank: 0 }],
  ])('answers 503 for %s', async (_, bad) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rows = [bad];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    vi.restoreAllMocks();
  });
});
