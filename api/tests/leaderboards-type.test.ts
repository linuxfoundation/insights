// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { leaderboardTypes, toEntry } from '../src/lib/leaderboards.js';
import {
  callsTo,
  mockFetch,
  pipeCalls,
  queryString,
  tinybirdStub,
  useApp,
} from './helpers/tinybird.js';

const route = '/v1-alpha/leaderboards/stars';
const pipePath = '/v0/pipes/leaderboards.json';
const cursorFor = (offset: number) => Buffer.from(String(offset)).toString('base64url');

const row = (rank: number) => ({
  rank,
  id: `id-${rank}`,
  segmentId: 'segment-1',
  name: `Project ${rank}`,
  slug: `project-${rank}`,
  logoUrl: '',
  leaderboardType: 'stars',
  value: 100 - rank,
  previousPeriodValue: 90 - rank,
  collectionsSlugs: ['cncf'],
  isLF: 1,
  githubHandleArray: [],
  status: 'active',
  totalCount: 11192,
});

// The pipe pages by page number and reports the filtered total in rows_before_limit_at_least.
let all: unknown[] = [];
let withTotal = true;
let reportedTotal: unknown;

const { get } = useApp();

beforeEach(() => {
  all = Array.from({ length: 5 }, (_, index) => row(index + 1));
  withTotal = true;
  reportedTotal = undefined;
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      const size = Number(url.searchParams.get('pageSize'));
      const start = Number(url.searchParams.get('page')) * size;
      const data = all.slice(start, start + size);
      return new Response(
        JSON.stringify({
          data,
          meta: [],
          rows: data.length,
          ...(withTotal ? { rows_before_limit_at_least: reportedTotal ?? all.length } : {}),
          statistics: { elapsed: 0.01, rows_read: 1, bytes_read: 1 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }),
  );
});

const pagesAsked = () =>
  callsTo(pipePath).map((url) => [url.searchParams.get('page'), url.searchParams.get('pageSize')]);

interface Body {
  type: string;
  data: { rank: number }[];
  pageSize: number;
  nextCursor: string | null;
}

const bodyOf = async (params: Record<string, string> = {}, path = route) => {
  const res = await get(`${path}?${queryString(params)}`);
  expect(res.statusCode).toBe(200);
  return res.json<Body>();
};
const ranks = (body: Body) => body.data.map((entry) => entry.rank);

describe('Tinybird call (AC1)', () => {
  it('asks the pipe once for the type, first page and pageSize', async () => {
    await bodyOf();
    expect(pipeCalls()).toHaveLength(1);
    const [call] = callsTo(pipePath);
    expect(call?.searchParams.get('leaderboardType')).toBe('stars');
    expect(pagesAsked()).toEqual([['0', '50']]);
    expect(call?.searchParams.has('search')).toBe(false);
    expect(call?.searchParams.has('collectionSlug')).toBe(false);
  });

  it.each([
    ['_', '\\_'],
    ['50%', '50\\%'],
    ['a\\b', 'a\\\\b'],
  ])('escapes the LIKE wildcards of search %s', async (search, sent) => {
    await bodyOf({ search });
    expect(callsTo(pipePath)[0]?.searchParams.get('search')).toBe(sent);
  });

  it('forwards search and collectionSlug', async () => {
    await bodyOf({ search: 'kube', collectionSlug: 'cncf' });
    const [call] = callsTo(pipePath);
    expect(call?.searchParams.get('search')).toBe('kube');
    expect(call?.searchParams.get('collectionSlug')).toBe('cncf');
  });

  it('leaves out empty search and collectionSlug', async () => {
    await bodyOf({ search: '', collectionSlug: '' });
    const [call] = callsTo(pipePath);
    expect(call?.searchParams.has('search')).toBe(false);
    expect(call?.searchParams.has('collectionSlug')).toBe(false);
  });
});

describe('type (AC2)', () => {
  it.each(['nope', 'longest-running', 'Stars'])(
    'answers 400 for type %s before calling Tinybird',
    async (type) => {
      const res = await get(`/v1-alpha/leaderboards/${type}`);
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it.each(leaderboardTypes.map((entry) => entry.type))('accepts %s', async (type) => {
    await bodyOf({}, `/v1-alpha/leaderboards/${type}`);
    expect(callsTo(pipePath)[0]?.searchParams.get('leaderboardType')).toBe(type);
  });
});

describe('paging (AC3, AC4)', () => {
  it('reads one pipe page for a cursor on a page boundary', async () => {
    const body = await bodyOf({ pageSize: '2', cursor: cursorFor(2) });
    expect(pagesAsked()).toEqual([['1', '2']]);
    expect(ranks(body)).toEqual([3, 4]);
  });

  it('reads two pipe pages and drops the leading rows for a cursor inside a page', async () => {
    const body = await bodyOf({ pageSize: '2', cursor: cursorFor(1) });
    expect(pagesAsked()).toEqual([
      ['0', '2'],
      ['1', '2'],
    ]);
    expect(ranks(body)).toEqual([2, 3]);
  });

  it('follows nextCursor until the total runs out', async () => {
    const first = await bodyOf({ pageSize: '2' });
    expect(ranks(first)).toEqual([1, 2]);
    expect(first.pageSize).toBe(2);
    const second = await bodyOf({ pageSize: '2', cursor: first.nextCursor! });
    expect(ranks(second)).toEqual([3, 4]);
    const last = await bodyOf({ pageSize: '2', cursor: second.nextCursor! });
    expect(ranks(last)).toEqual([5]);
    expect(last.nextCursor).toBeNull();
  });

  it('answers nextCursor null when the page ends exactly at the total', async () => {
    all = all.slice(0, 4);
    const body = await bodyOf({ pageSize: '2', cursor: cursorFor(2) });
    expect(body.nextCursor).toBeNull();
  });

  it('takes the total from rows_before_limit_at_least, not from totalCount', async () => {
    const body = await bodyOf({ pageSize: '5' });
    expect(ranks(body)).toHaveLength(5);
    expect(body.nextCursor).toBeNull();
  });

  describe('with a total below the rows already seen', () => {
    beforeEach(() => {
      reportedTotal = 1;
    });

    it('falls back to the full last pipe page', async () => {
      const body = await bodyOf({ pageSize: '2' });
      expect(ranks(body)).toEqual([1, 2]);
      expect(body.nextCursor).toEqual(expect.any(String));
    });

    it('answers nextCursor null when the last pipe page is short', async () => {
      const body = await bodyOf({ pageSize: '2', cursor: cursorFor(4) });
      expect(ranks(body)).toEqual([5]);
      expect(body.nextCursor).toBeNull();
    });
  });

  describe('without rows_before_limit_at_least', () => {
    beforeEach(() => {
      withTotal = false;
    });

    it('assumes a next page when the last pipe page is full', async () => {
      const body = await bodyOf({ pageSize: '2' });
      expect(body.nextCursor).toEqual(expect.any(String));
    });

    it('answers nextCursor null when the last pipe page is short', async () => {
      const body = await bodyOf({ pageSize: '2', cursor: cursorFor(4) });
      expect(ranks(body)).toEqual([5]);
      expect(body.nextCursor).toBeNull();
    });

    it('counts the rows before a misaligned cursor when the last pipe page is full', async () => {
      const body = await bodyOf({ pageSize: '2', cursor: cursorFor(1) });
      expect(ranks(body)).toEqual([2, 3]);
      expect(body.nextCursor).toEqual(expect.any(String));
    });

    it('answers nextCursor null for a misaligned cursor when the last pipe page is short', async () => {
      const body = await bodyOf({ pageSize: '2', cursor: cursorFor(3) });
      expect(ranks(body)).toEqual([4, 5]);
      expect(body.nextCursor).toBeNull();
    });
  });
});

describe('response (AC5)', () => {
  it('returns the catalog entry with the mapped entries', async () => {
    all = [row(1)];
    const catalog = leaderboardTypes.find((entry) => entry.type === 'stars');
    expect(await bodyOf()).toEqual({
      ...catalog,
      data: [toEntry(row(1))],
      pageSize: 50,
      nextCursor: null,
    });
  });

  it('keeps global ranks under a filter', async () => {
    all = [row(1523), row(1556)];
    expect(ranks(await bodyOf({ search: 'kube' }))).toEqual([1523, 1556]);
  });
});

describe('row guard (AC6)', () => {
  it('answers 503 for a row failing the entry guard', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    all = [{ ...row(1), rank: 0 }];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    vi.restoreAllMocks();
  });

  it.each([-1, 1.5, '5'])('answers 503 for the row total %j', async (value) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    reportedTotal = value;
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    vi.restoreAllMocks();
  });
});
