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

const route = '/v1-alpha/oss-index/groups';
const pipePath = '/v0/pipes/category_groups_oss_index.json';

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'g1',
  name: 'Programming Languages',
  type: 'horizontal',
  slug: 'programming-languages-horizontal',
  totalContributors: 9305223,
  softwareValue: 135666024614,
  avgScore: 0.41,
  projectCount: 5279,
  topCollections: [['c1', 726549, 'Frontend', 1917065599, 0.45]],
  topProjects: [
    ['p1', 315948, 'Node.js', 'https://logo.test/n.png', 24048486264, 0, 86, 'Runtime', 'active'],
  ],
  ...overrides,
});

let rows: unknown[] = [];
const { get } = useApp();

beforeEach(() => {
  rows = [row()];
  mockFetch.mockImplementation(tinybirdStub(() => rows));
});

describe('GET /v1-alpha/oss-index/groups', () => {
  it('maps group fields and converts both tuple lists', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [
        {
          id: 'g1',
          name: 'Programming Languages',
          type: 'horizontal',
          slug: 'programming-languages-horizontal',
          totalContributors: 9305223,
          softwareValue: 135666024614,
          avgScore: 0.41,
          projectCount: 5279,
          topCollections: [
            {
              id: 'c1',
              count: 726549,
              name: 'Frontend',
              softwareValue: 1917065599,
              avgScore: 0.45,
            },
          ],
          topProjects: [
            {
              id: 'p1',
              count: 315948,
              name: 'Node.js',
              logoUrl: 'https://logo.test/n.png',
              description: 'Runtime',
              softwareValue: 24048486264,
              avgScore: 0,
              healthScore: 86,
              status: 'active',
            },
          ],
        },
      ],
    });
  });

  it('answers an empty list', async () => {
    rows = [];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
  });

  it('forwards totalContributors as orderBy by default and omits type', async () => {
    await get(route);
    expect(pipeCalls()).toHaveLength(1);
    const [call] = callsTo(pipePath);
    expect(call?.searchParams.get('orderBy')).toBe('totalContributors');
    expect(call?.searchParams.has('type')).toBe(false);
  });

  it('forwards an explicit sort as orderBy', async () => {
    await get(`${route}?sort=softwareValue`);
    expect(callsTo(pipePath)[0]?.searchParams.get('orderBy')).toBe('softwareValue');
  });

  it('forwards type when given', async () => {
    await get(`${route}?type=vertical`);
    expect(callsTo(pipePath)[0]?.searchParams.get('type')).toBe('vertical');
  });

  it('omits an empty type', async () => {
    await get(`${route}?type=`);
    expect(callsTo(pipePath)[0]?.searchParams.has('type')).toBe(false);
  });

  it('rejects an unknown sort with 400 before calling the pipe', async () => {
    const res = await get(`${route}?sort=bogus`);
    expect(res.statusCode).toBe(400);
    expect(pipeCalls()).toHaveLength(0);
  });

  it.each([
    ['a missing group id', row({ id: undefined })],
    ['a non-array topProjects', row({ topProjects: 'x' })],
    ['a malformed collection tuple', row({ topCollections: [['c1', 1, null, 1, 1]] })],
    ['a short project tuple', row({ topProjects: [['p1', 1, 'n']] })],
    ['a null project logo', row({ topProjects: [['p1', 1, 'n', null, 1, 1, 1, 'd', 's']] })],
  ])('answers 503 upstream_unavailable for %s', async (_label, bad) => {
    rows = [bad];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.body).toContain('upstream_unavailable');
  });

  it('is listed in the OpenAPI spec under the OSS Index tag', async () => {
    const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    const op = spec.paths[route]?.get as { tags?: string[] } | undefined;
    expect(op?.tags).toEqual(['OSS Index']);
  });
});
