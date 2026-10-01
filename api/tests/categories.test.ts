// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { callsTo, mockFetch, pipeCalls, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/categories';
const pipePath = '/v0/pipes/category_list.json';

const row = (
  group: string,
  name: string,
  groupId = `group-${group}`,
  id = `${groupId}-${name}`,
) => ({
  id,
  name,
  slug: name.toLowerCase(),
  categoryGroupId: groupId,
  categoryGroupName: group,
  categoryGroupSlug: group.toLowerCase(),
  categoryGroupType: 'vertical',
});

let rows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  rows = [];
  mockFetch.mockImplementation(tinybirdStub(() => rows));
});

interface Page {
  data: { id: string; name: string; categories: { id: string; name: string }[] }[];
  pageSize: number;
  nextCursor: string | null;
}

const pageOf = async (query = '') => {
  const res = await get(`${route}${query}`);
  expect(res.statusCode).toBe(200);
  return res.json<Page>();
};

describe('grouping', () => {
  it('returns each group with its categories as {id, name}', async () => {
    rows = [row('Cloud', 'Serverless'), row('Cloud', 'Containers')];
    const { data } = await pageOf();
    expect(data).toEqual([
      {
        id: 'group-Cloud',
        name: 'Cloud',
        categories: [
          { id: 'group-Cloud-Containers', name: 'Containers' },
          { id: 'group-Cloud-Serverless', name: 'Serverless' },
        ],
      },
    ]);
  });

  it('gathers the rows of a group that are not next to each other', async () => {
    rows = [row('A', 'one'), row('B', 'two'), row('A', 'three')];
    const { data } = await pageOf();
    expect(data.map((group) => [group.name, group.categories.length])).toEqual([
      ['A', 2],
      ['B', 1],
    ]);
  });

  it('orders groups by name, then by id when names repeat', async () => {
    rows = [row('B', 'x', 'g2'), row('A', 'y', 'g9'), row('A', 'z', 'g1')];
    const { data } = await pageOf();
    expect(data.map((group) => group.id)).toEqual(['g1', 'g9', 'g2']);
  });

  it('orders categories by name, then by id when names repeat', async () => {
    rows = [
      row('A', 'same', 'g1', 'c9'),
      row('A', 'same', 'g1', 'c1'),
      row('A', 'first', 'g1', 'c5'),
    ];
    const { data } = await pageOf();
    expect(data[0]?.categories.map((category) => category.id)).toEqual(['c5', 'c1', 'c9']);
  });

  it('answers an empty page when the pipe has no rows', async () => {
    expect(await pageOf()).toEqual({ data: [], pageSize: 50, nextCursor: null });
  });
});

describe('Tinybird call', () => {
  it('reads the pipe once, asking for every row ordered by group name', async () => {
    await pageOf();
    const calls = callsTo(pipePath);
    expect(pipeCalls()).toHaveLength(1);
    expect(calls[0]?.searchParams.get('page')).toBe('0');
    expect(Number(calls[0]?.searchParams.get('pageSize'))).toBeGreaterThanOrEqual(1000);
    expect(calls[0]?.searchParams.get('orderBy')).toBe('categoryGroupName');
    expect(calls[0]?.searchParams.get('orderDirection')).toBe('asc');
  });

  it('reads further pipe pages until one comes back short', async () => {
    await pageOf();
    const full = Number(callsTo(pipePath)[0]?.searchParams.get('pageSize'));
    mockFetch.mockClear();
    mockFetch.mockImplementation(
      tinybirdStub((url) =>
        url.searchParams.get('page') === '0'
          ? Array.from({ length: full }, (_, i) => row('A', `c${i}`))
          : [row('B', 'last')],
      ),
    );
    const { data } = await pageOf();
    expect(callsTo(pipePath).map((url) => url.searchParams.get('page'))).toEqual(['0', '1']);
    expect(data.map((group) => [group.name, group.categories.length])).toEqual([
      ['A', full],
      ['B', 1],
    ]);
  });

  it('forwards search and type as search and categoryGroupType', async () => {
    await pageOf('?search=open&type=vertical');
    const params = callsTo(pipePath)[0]!.searchParams;
    expect(params.get('search')).toBe('open');
    expect(params.get('categoryGroupType')).toBe('vertical');
  });

  it.each(['?search=&type=', ''])('omits search and type for query %j', async (query) => {
    await pageOf(query);
    const params = callsTo(pipePath)[0]!.searchParams;
    expect(params.has('search')).toBe(false);
    expect(params.has('categoryGroupType')).toBe(false);
  });

  it.each([
    ['a numeric id', { id: 1 }],
    ['a null name', { name: null }],
    ['a missing group id', { categoryGroupId: undefined }],
    ['a missing group name', { categoryGroupName: undefined }],
  ])('answers 503 for a row with %s', async (_name, change) => {
    rows = [{ ...row('A', 'x'), ...change }];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ code: 'upstream_unavailable' });
  });
});

describe('paging over groups', () => {
  beforeEach(() => {
    rows = ['A', 'B', 'C'].flatMap((group) => [row(group, '1'), row(group, '2'), row(group, '3')]);
  });

  it('counts groups, not rows, against pageSize', async () => {
    const page = await pageOf('?pageSize=2');
    expect(page.data.map((group) => group.name)).toEqual(['A', 'B']);
    expect(page.data.every((group) => group.categories.length === 3)).toBe(true);
    expect(page.pageSize).toBe(2);
    expect(page.nextCursor).toEqual(expect.any(String));
  });

  it('continues from nextCursor without splitting or repeating a group', async () => {
    const first = await pageOf('?pageSize=2');
    const second = await pageOf(`?pageSize=2&cursor=${first.nextCursor}`);
    expect(second.data.map((group) => group.name)).toEqual(['C']);
    expect(second.data[0]?.categories).toHaveLength(3);
    expect(second.nextCursor).toBeNull();
  });

  it('answers nextCursor null when the groups fill the page exactly', async () => {
    expect((await pageOf('?pageSize=3')).nextCursor).toBeNull();
  });
});
