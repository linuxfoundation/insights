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

const route = '/v1-alpha/oss-index/categories';
const slug = 'runtime-horizontal';
const groupsPath = '/v0/pipes/category_groups_list.json';
const categoriesPath = '/v0/pipes/categories_oss_index.json';

const group = (overrides: Record<string, unknown> = {}) => ({
  name: 'Runtime',
  slug,
  type: 'horizontal',
  ...overrides,
});

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'k1',
  name: 'Container Runtime',
  slug: 'container-runtime',
  totalContributors: 325024,
  softwareValue: 22334455569,
  avgScore: 0.255,
  topCollections: [['c1', 292599, 'Container Engines', 14653059859, 0.29]],
  topProjects: [['p1', 119387, 'Kubernetes', 'https://logo.test/k.png', 6002018897, 0, 86, 'K8s']],
  ...overrides,
});

let groups: unknown[] = [];
let rows: unknown[] = [];
const { get } = useApp();

beforeEach(() => {
  groups = [group()];
  rows = [row()];
  mockFetch.mockImplementation(
    tinybirdStub((url) => (url.pathname === groupsPath ? groups : rows)),
  );
});

describe('GET /v1-alpha/oss-index/categories', () => {
  it('answers the group details with its mapped categories', async () => {
    const res = await get(`${route}?categoryGroupSlug=${slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      name: 'Runtime',
      slug,
      type: 'horizontal',
      categories: [
        {
          id: 'k1',
          name: 'Container Runtime',
          slug: 'container-runtime',
          totalContributors: 325024,
          softwareValue: 22334455569,
          avgScore: 0.255,
          topCollections: [
            {
              id: 'c1',
              count: 292599,
              name: 'Container Engines',
              softwareValue: 14653059859,
              avgScore: 0.29,
            },
          ],
          topProjects: [
            {
              id: 'p1',
              count: 119387,
              name: 'Kubernetes',
              logoUrl: 'https://logo.test/k.png',
              description: 'K8s',
              softwareValue: 6002018897,
              avgScore: 0,
              healthScore: 86,
            },
          ],
        },
      ],
    });
  });

  it('looks the group up by slug, then lists its categories', async () => {
    await get(`${route}?categoryGroupSlug=${slug}`);
    expect(pipeCalls().map((url) => url.pathname)).toEqual([groupsPath, categoriesPath]);
    expect(callsTo(groupsPath)[0]?.searchParams.get('slug')).toBe(slug);
    const [call] = callsTo(categoriesPath);
    expect(call?.searchParams.get('categoryGroupSlug')).toBe(slug);
    expect(call?.searchParams.get('orderBy')).toBe('totalContributors');
  });

  it('forwards an explicit sort as orderBy', async () => {
    await get(`${route}?categoryGroupSlug=${slug}&sort=softwareValue`);
    expect(callsTo(categoriesPath)[0]?.searchParams.get('orderBy')).toBe('softwareValue');
  });

  it('answers an empty category list', async () => {
    rows = [];
    const res = await get(`${route}?categoryGroupSlug=${slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ...group(), categories: [] });
  });

  it('answers 404 for an unknown group without listing categories', async () => {
    groups = [];
    const res = await get(`${route}?categoryGroupSlug=nope`);
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'not_found' });
    expect(callsTo(categoriesPath)).toHaveLength(0);
  });

  it.each([
    ['a missing slug', ''],
    ['an empty slug', '?categoryGroupSlug='],
    ['an unknown sort', `?categoryGroupSlug=${slug}&sort=bogus`],
  ])('rejects %s with 400 before calling a pipe', async (_label, qs) => {
    const res = await get(`${route}${qs}`);
    expect(res.statusCode).toBe(400);
    expect(pipeCalls()).toHaveLength(0);
  });

  it.each([
    ['a missing category id', row({ id: undefined })],
    ['a non-array topProjects', row({ topProjects: 'x' })],
    ['a malformed collection tuple', row({ topCollections: [['c1', 1, null, 1, 1]] })],
    ['a short project tuple', row({ topProjects: [['p1', 1, 'n']] })],
    ['a nine slot project tuple', row({ topProjects: [['p1', 1, 'n', 'l', 1, 1, 1, 'd', 's']] })],
    ['a null project logo', row({ topProjects: [['p1', 1, 'n', null, 1, 1, 1, 'd']] })],
  ])('answers 503 upstream_unavailable for %s', async (_label, bad) => {
    rows = [bad];
    const res = await get(`${route}?categoryGroupSlug=${slug}`);
    expect(res.statusCode).toBe(503);
    expect(res.body).toContain('upstream_unavailable');
  });

  it('answers 503 upstream_unavailable for a malformed group row', async () => {
    groups = [group({ name: null })];
    const res = await get(`${route}?categoryGroupSlug=${slug}`);
    expect(res.statusCode).toBe(503);
    expect(res.body).toContain('upstream_unavailable');
    expect(callsTo(categoriesPath)).toHaveLength(0);
  });

  it('is listed in the OpenAPI spec under the OSS Index tag', async () => {
    const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    const op = spec.paths[route]?.get as { tags?: string[] } | undefined;
    expect(op?.tags).toEqual(['OSS Index']);
  });
});
