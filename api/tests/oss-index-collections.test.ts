// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  pipeCalls,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const route = '/v1-alpha/oss-index/collections';
const pipePath = '/v0/pipes/collections_oss_index.json';
const categoryPath = '/v0/pipes/category_list.json';

const category = {
  id: 'cat1',
  name: 'API Clients',
  slug: 'api-clients',
  categoryGroupId: 'g1',
  categoryGroupName: 'Developer Tools',
  categoryGroupSlug: 'developer-tools-horizontal',
  categoryGroupType: 'horizontal',
};

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'REST API & HTTP Client Libraries',
  slug: 'rest-api-client-libraries',
  totalContributors: 133041,
  softwareValue: 962602659,
  avgScore: 0.41,
  projectCount: 171,
  topProjects: [
    ['p1', 13759, 'Istio', 'https://logo.test/i.png', 475232855, 0, 83, 'Mesh', 'istio', 'active'],
  ],
  ...overrides,
});

const numbered = (count: number) => Array.from({ length: count }, (_, i) => row({ id: `c${i}` }));

let rows: unknown[] = [];
let categories: unknown[] = [];
const { get } = useApp();

beforeEach(() => {
  rows = [row()];
  categories = [category];
  mockFetch.mockImplementation(
    tinybirdStub((url) => (url.pathname === categoryPath ? categories : rows)),
  );
});

const cursorOf = (offset: number) => Buffer.from(String(offset)).toString('base64url');

describe('GET /v1-alpha/oss-index/collections', () => {
  it('maps collection fields and converts project tuples including the slug', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [
        {
          id: 'c1',
          name: 'REST API & HTTP Client Libraries',
          slug: 'rest-api-client-libraries',
          totalContributors: 133041,
          softwareValue: 962602659,
          avgScore: 0.41,
          projectCount: 171,
          topProjects: [
            {
              id: 'p1',
              count: 13759,
              name: 'Istio',
              slug: 'istio',
              logoUrl: 'https://logo.test/i.png',
              description: 'Mesh',
              softwareValue: 475232855,
              avgScore: 0,
              healthScore: 83,
              status: 'active',
            },
          ],
        },
      ],
      pageSize: 50,
      nextCursor: null,
    });
  });

  it('answers an empty list', async () => {
    rows = [];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [], pageSize: 50, nextCursor: null });
  });

  it('sends the default sort, first page and page size, and omits the filters', async () => {
    await get(route);
    expect(pipeCalls()).toHaveLength(1);
    const [call] = callsTo(pipePath);
    expect(call?.searchParams.get('orderBy')).toBe('totalContributors');
    expect(call?.searchParams.get('page')).toBe('0');
    expect(call?.searchParams.get('pageSize')).toBe('50');
    expect(call?.searchParams.has('categorySlug')).toBe(false);
    expect(call?.searchParams.has('categoryGroupId')).toBe(false);
  });

  it('forwards an explicit sort as orderBy', async () => {
    await get(`${route}?sort=softwareValue`);
    expect(callsTo(pipePath)[0]?.searchParams.get('orderBy')).toBe('softwareValue');
  });

  it('rejects an unknown sort with 400 before calling a pipe', async () => {
    const res = await get(`${route}?sort=bogus`);
    expect(res.statusCode).toBe(400);
    expect(pipeCalls()).toHaveLength(0);
  });

  it('forwards categoryGroupId when given and omits it when empty', async () => {
    await get(`${route}?categoryGroupId=g1`);
    await get(`${route}?categoryGroupId=`);
    const calls = callsTo(pipePath);
    expect(calls[0]?.searchParams.get('categoryGroupId')).toBe('g1');
    expect(calls[1]?.searchParams.has('categoryGroupId')).toBe(false);
  });

  it('does not look up a category without categorySlug', async () => {
    await get(route);
    await get(`${route}?categorySlug=`);
    expect(callsTo(categoryPath)).toHaveLength(0);
    expect(callsTo(pipePath)[1]?.searchParams.has('categorySlug')).toBe(false);
  });

  it('looks up the category by slug, forwards the slug and returns the category', async () => {
    const res = await get(`${route}?categorySlug=api-clients`);
    expect(res.statusCode).toBe(200);
    expect(callsTo(categoryPath)).toHaveLength(1);
    expect(callsTo(categoryPath)[0]?.searchParams.get('slug')).toBe('api-clients');
    expect(callsTo(pipePath)[0]?.searchParams.get('categorySlug')).toBe('api-clients');
    expect(res.json().category).toEqual(category);
  });

  it('leaves category out of the body when categorySlug is absent', async () => {
    const res = await get(route);
    expect(res.json()).not.toHaveProperty('category');
  });

  it('answers 404 for an unknown category slug without calling the collections pipe', async () => {
    categories = [];
    const res = await get(`${route}?categorySlug=nope`);
    expect(res.statusCode).toBe(404);
    expect(res.json().code).toBe('not_found');
    expect(callsTo(pipePath)).toHaveLength(0);
  });

  it('answers 503 for a malformed category row', async () => {
    categories = [{ ...category, categoryGroupSlug: null }];
    const res = await get(`${route}?categorySlug=api-clients`);
    expect(res.statusCode).toBe(503);
    expect(res.body).toContain('upstream_unavailable');
  });
});

describe('paging', () => {
  it('returns a nextCursor when a full page is read', async () => {
    rows = numbered(2);
    const res = await get(`${route}?pageSize=2`);
    expect(res.json().data).toHaveLength(2);
    expect(res.json().pageSize).toBe(2);
    expect(res.json().nextCursor).toBe(cursorOf(2));
    expect(callsTo(pipePath)[0]?.searchParams.get('pageSize')).toBe('2');
  });

  it('returns a null nextCursor on a short last page', async () => {
    rows = numbered(1);
    const res = await get(`${route}?pageSize=2`);
    expect(res.json().nextCursor).toBeNull();
  });

  it('continues from a cursor by reading the matching pipe page', async () => {
    rows = numbered(2);
    const res = await get(`${route}?pageSize=2&cursor=${cursorOf(4)}`);
    expect(res.statusCode).toBe(200);
    const pages = callsTo(pipePath).map((call) => call.searchParams.get('page'));
    expect(pages).toEqual(['2']);
    expect(res.json().nextCursor).toBe(cursorOf(6));
  });

  describe('with a page-aware pipe', () => {
    const ids = (res: { json: () => { data: { id: string }[] } }) =>
      res.json().data.map((item) => item.id);

    beforeEach(() => {
      const all = numbered(5);
      mockFetch.mockImplementation(
        tinybirdStub((url) => {
          if (url.pathname === categoryPath) {
            return categories;
          }
          const size = Number(url.searchParams.get('pageSize'));
          const page = Number(url.searchParams.get('page'));
          return all.slice(page * size, page * size + size);
        }),
      );
    });

    it('returns the rows after a mid-page cursor from two pipe pages', async () => {
      const res = await get(`${route}?pageSize=2&cursor=${cursorOf(1)}`);
      const pages = callsTo(pipePath).map((call) => call.searchParams.get('page'));
      expect(pages.sort()).toEqual(['0', '1']);
      expect(ids(res)).toEqual(['c1', 'c2']);
      expect(res.json().nextCursor).toBe(cursorOf(3));
    });

    it('returns the last rows and a null nextCursor near the end', async () => {
      const res = await get(`${route}?pageSize=2&cursor=${cursorOf(3)}`);
      expect(ids(res)).toEqual(['c3', 'c4']);
      expect(res.json().nextCursor).toBeNull();
    });

    it('walks every row once by following nextCursor', async () => {
      const seen: string[] = [];
      let cursor: string | null = null;
      for (let i = 0; i < 10; i += 1) {
        const res = await get(`${route}?pageSize=2${cursor ? `&cursor=${cursor}` : ''}`);
        seen.push(...ids(res));
        cursor = res.json().nextCursor;
        if (!cursor) {
          break;
        }
      }
      expect(seen).toEqual(['c0', 'c1', 'c2', 'c3', 'c4']);
      expect(cursor).toBeNull();
    });
  });

  it('answers 400 for an invalid cursor before calling a pipe', async () => {
    const res = await get(`${route}?cursor=not-a-cursor!`);
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('invalid_request');
    expect(pipeCalls()).toHaveLength(0);
  });

  it('answers 400 for a page size out of range', async () => {
    expect((await get(`${route}?pageSize=0`)).statusCode).toBe(400);
    expect((await get(`${route}?pageSize=201`)).statusCode).toBe(400);
  });
});

describe('malformed rows', () => {
  it.each([
    ['a missing collection id', row({ id: undefined })],
    ['a null slug', row({ slug: null })],
    ['a missing project count', row({ projectCount: undefined })],
    ['a non-array topProjects', row({ topProjects: 'x' })],
    [
      'the 9 slot project tuple',
      row({ topProjects: [['p1', 1, 'n', 'l', 1, 1, 1, 'd', 'active']] }),
    ],
    [
      'a null project slug',
      row({ topProjects: [['p1', 1, 'n', 'l', 1, 1, 1, 'd', null, 'active']] }),
    ],
    ['a negative totalContributors', row({ totalContributors: -1 })],
    ['a fractional projectCount', row({ projectCount: 2.5 })],
    [
      'a fractional project count',
      row({ topProjects: [['p1', 1.5, 'n', 'l', 1, 1, 1, 'd', 's', 'active']] }),
    ],
  ])('answers 503 upstream_unavailable for %s', async (_label, bad) => {
    rows = [bad];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.body).toContain('upstream_unavailable');
  });
});

describe('OpenAPI', () => {
  it('lists the route under the OSS Index tag', async () => {
    const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    const op = spec.paths[route]?.get;
    expect(op?.tags).toEqual(['OSS Index']);
    const names = op?.parameters?.map((param) => param.name) ?? [];
    expect(names).toEqual(
      expect.arrayContaining(['categorySlug', 'categoryGroupId', 'sort', 'cursor', 'pageSize']),
    );
  });
});
