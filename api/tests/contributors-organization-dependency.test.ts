// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  atDate,
  callsTo,
  contributorsPath,
  mockFetch,
  pipeCalls,
  queryString,
  resolveSchema,
  tinybirdHost,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const dependencyPath = '/v0/pipes/organization_dependency.json';
const leaderboardPath = '/v0/pipes/organizations_leaderboard.json';

const dependencyRow = (id: string, contributionPercentageRunningTotal: number) => ({
  id,
  displayName: `Organization ${id}`,
  contributionPercentage: 10,
  contributionPercentageRunningTotal,
  totalOrganizationCount: 952,
});

// The pipe's outer query has no ORDER BY, so these come shuffled.
const dependencyRows = [
  dependencyRow('b', 30.2),
  dependencyRow('c', 52.35),
  dependencyRow('a', 17.3),
];

// `id` is the organization id the pipe ranks by, which the route drops.
const leaderboardRow = (
  key: string,
  contributionCount: number,
  contributionPercentage: number,
) => ({
  id: `id-${key}`,
  slug: `organization-${key}`,
  logo: `https://logos.test/${key}.svg`,
  displayName: `Organization ${key}`,
  contributionCount,
  contributionPercentage,
});

const leaderboardRows = [
  leaderboardRow('a', 1730, 17.3),
  leaderboardRow('b', 1290, 12.9),
  leaderboardRow('c', 2215, 22.15),
  leaderboardRow('d', 900, 9),
  { ...leaderboardRow('e', 410, 4.1), logo: '' },
];

const expectedData = leaderboardRows.map((row) => ({
  name: row.displayName,
  slug: row.slug,
  logo: row.logo,
  contributions: row.contributionCount,
  contributionPercentage: row.contributionPercentage,
}));

const emptyBody = {
  topOrganizations: { count: 0, contributionPercentage: 0 },
  otherOrganizations: { count: 0, contributionPercentage: 0 },
  data: [],
};

interface PipeRows {
  bucket?: object[];
  dependency?: object[];
  leaderboard?: object[];
}

const routeTinybird = ({
  bucket,
  dependency = dependencyRows,
  leaderboard = leaderboardRows,
}: PipeRows = {}) =>
  tinybirdStub((call) => (call.pathname === dependencyPath ? dependency : leaderboard), bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/contributors/organization-dependency?${queryString({
    startDate,
    endDate,
    ...params,
  })}`;

const bothCalls = () => [callsTo(dependencyPath)[0], callsTo(leaderboardPath)[0]];

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/contributors/organization-dependency (AC1, AC2)', () => {
  it('returns the top group, the other organizations and the top five with the renamed fields', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      topOrganizations: { count: 3, contributionPercentage: 52.35 },
      otherOrganizations: { count: 949, contributionPercentage: 47.65 },
      data: expectedData,
    });
  });

  it('returns only the documented keys, dropping the organization id, website and extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        dependency: dependencyRows.map((row) => ({ ...row, extra: 'x' })),
        leaderboard: leaderboardRows.map((row) => ({
          ...row,
          website: 'https://site.test',
          extra: 'x',
        })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<Record<string, Record<string, unknown>> & { data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'otherOrganizations', 'topOrganizations']);
    for (const group of ['topOrganizations', 'otherOrganizations']) {
      expect(Object.keys(body[group] ?? {}).sort(), group).toEqual([
        'contributionPercentage',
        'count',
      ]);
    }
    expect(body.data).toHaveLength(leaderboardRows.length);
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual([
        'contributionPercentage',
        'contributions',
        'logo',
        'name',
        'slug',
      ]);
    }
    expect(res.body).not.toContain(leaderboardRows[0]!.id);
    expect(res.body).not.toContain('https://site.test');
  });

  it('takes the top share from the largest running total whatever order the rows come in', async () => {
    for (const rows of [dependencyRows, [...dependencyRows].reverse()]) {
      mockFetch.mockReset().mockImplementation(routeTinybird({ dependency: rows }));
      const res = await get(url());
      expect(res.statusCode).toBe(200);
      expect(res.json().topOrganizations).toEqual({ count: 3, contributionPercentage: 52.35 });
    }
  });

  it("rounds both shares to two decimals, dropping the float noise of the pipe's running total", async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        dependency: [dependencyRow('a', 30.12), dependencyRow('b', 51.370000000000005)],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      topOrganizations: { count: 2, contributionPercentage: 51.37 },
      otherOrganizations: { count: 950, contributionPercentage: 48.63 },
    });
  });

  it('rounds the other share too, where 100 minus the top share leaves float noise', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ dependency: [dependencyRow('a', 30.12), dependencyRow('b', 64.01)] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      topOrganizations: { count: 2, contributionPercentage: 64.01 },
      otherOrganizations: { count: 950, contributionPercentage: 35.99 },
    });
  });

  it('keeps a top group below 51% when the pipe returns one, as the 10-organization cap does', async () => {
    const capped = Array.from({ length: 10 }, (_, rank) =>
      dependencyRow(`org-${rank}`, (rank + 1) * 4.5),
    );
    mockFetch.mockImplementation(routeTinybird({ dependency: capped }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      topOrganizations: { count: 10, contributionPercentage: 45 },
      otherOrganizations: { count: 942, contributionPercentage: 55 },
    });
  });

  it('floors otherOrganizations.count at 0 when the total is below the top group', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        dependency: dependencyRows.map((row) => ({ ...row, totalOrganizationCount: 2 })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().otherOrganizations.count).toBe(0);
  });

  it('reads only the two group columns of a dependency row', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        dependency: [{ contributionPercentageRunningTotal: 64.5, totalOrganizationCount: 9 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      topOrganizations: { count: 1, contributionPercentage: 64.5 },
      otherOrganizations: { count: 8, contributionPercentage: 35.5 },
    });
  });
});

describe('empty results (AC3)', () => {
  it('answers zeros for both groups and an empty data list when the pipes return no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ dependency: [], leaderboard: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
  });

  it('answers the same zeros for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
    vi.restoreAllMocks();
  });
});

// organizations_leaderboard orders by contribution count, then organization id, both descending,
// in its only node, so its rows already arrive ranked.
describe('top five (AC4)', () => {
  it('lists the leaderboard rows in the order the pipe returns them, ties included', async () => {
    const rows = [
      { ...leaderboardRow('11111111-1111-4111-8111-111111111111', 10, 20), displayName: 'Top' },
      { ...leaderboardRow('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 5, 10), displayName: 'Zeta' },
      { ...leaderboardRow('55555555-5555-4555-8555-555555555555', 5, 10), displayName: 'Alpha' },
    ];
    mockFetch.mockImplementation(routeTinybird({ leaderboard: rows }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json<{ data: { name: string }[] }>().data.map((item) => item.name)).toEqual([
      'Top',
      'Zeta',
      'Alpha',
    ]);
  });
});

describe('Tinybird calls (AC5)', () => {
  it('makes one organization_dependency call at the pipe default and one organizations_leaderboard call for the top five', async () => {
    await get(url());
    expect(pipeCalls()).toHaveLength(2);
    expect(callsTo(dependencyPath)).toHaveLength(1);
    expect(callsTo(leaderboardPath)).toHaveLength(1);
    const [dependency, leaderboard] = bothCalls();
    expect(dependency?.searchParams.has('limit')).toBe(false);
    expect(dependency?.searchParams.has('offset')).toBe(false);
    expect(dependency?.searchParams.has('count')).toBe(false);
    expect(leaderboard?.searchParams.get('limit')).toBe('5');
    expect(leaderboard?.searchParams.get('offset')).toBe('0');
    expect(leaderboard?.searchParams.has('count')).toBe(false);
    for (const call of bothCalls()) {
      expect(call?.origin).toBe(tinybirdHost);
      expect(call?.searchParams.get('project')).toBe('kubernetes');
      expect(call?.searchParams.get('startDate')).toBe(atMidnight(startDate));
      expect(call?.searchParams.get('endDate')).toBe(atMidnight(endDate));
    }
  });

  it('counts code contributions and leaves collaborations out by default, on both calls', async () => {
    await get(url());
    for (const call of bothCalls()) {
      expect(call?.searchParams.get('includeCodeContributions')).toBe('true');
      expect(call?.searchParams.get('includeCollaborations')).toBe('false');
    }
  });

  it('forwards both contribution flags when the caller sets them, on both calls', async () => {
    const res = await get(
      url({ includeCodeContributions: 'false', includeCollaborations: 'true' }),
    );
    expect(res.statusCode).toBe(200);
    for (const call of bothCalls()) {
      expect(call?.searchParams.get('includeCodeContributions')).toBe('false');
      expect(call?.searchParams.get('includeCollaborations')).toBe('true');
    }
  });

  it('sends no platform or activity type filter when the caller omits them', async () => {
    await get(url());
    for (const call of bothCalls()) {
      expect(call?.searchParams.has('platform')).toBe(false);
      expect(call?.searchParams.has('activity_type')).toBe(false);
      expect(call?.searchParams.has('activityType')).toBe(false);
    }
  });

  it('forwards platform and activityType, as the activity_type the pipes read, on both calls', async () => {
    const res = await get(url({ platform: 'git', activityType: 'authored-commit' }));
    expect(res.statusCode).toBe(200);
    for (const call of bothCalls()) {
      expect(call?.searchParams.get('platform')).toBe('git');
      expect(call?.searchParams.get('activity_type')).toBe('authored-commit');
      expect(call?.searchParams.has('activityType')).toBe(false);
    }
  });

  it('defaults the range to 2010-01-01 through today on both calls when both dates are omitted', async () => {
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      for (const call of bothCalls()) {
        expect(call?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
        expect(call?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
      }
    });
  });
});

describe('Tinybird failures (AC6)', () => {
  const valid = dependencyRow('z', 60);
  it.each([
    ['without the running total', { ...valid, contributionPercentageRunningTotal: undefined }],
    ['with a string running total', { ...valid, contributionPercentageRunningTotal: '60' }],
    ['without the organization total', { ...valid, totalOrganizationCount: undefined }],
    ['with a fractional organization total', { ...valid, totalOrganizationCount: 2.5 }],
    ['with a negative organization total', { ...valid, totalOrganizationCount: -1 }],
    ['with a string organization total', { ...valid, totalOrganizationCount: 'many' }],
  ])('maps an organization_dependency row %s to 503 upstream_unavailable', async (_case, row) => {
    mockFetch.mockImplementation(routeTinybird({ dependency: [...dependencyRows, row] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('many');
  });

  it.each([
    ['with a negative contribution count', { contributionCount: -1 }],
    ['without the slug', { slug: undefined }],
  ])(
    'maps an organizations_leaderboard row %s, which the shared guard rejects, to 503',
    async (_case, fault) => {
      const row = { ...leaderboardRow('f', 1, 0.1), ...fault };
      mockFetch.mockImplementation(routeTinybird({ leaderboard: [...leaderboardRows, row] }));
      const res = await get(url());
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
    },
  );
});

describe('OpenAPI (AC7)', () => {
  async function getSpec() {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const spec = res.json<OpenApiDoc>();
    const responseOf = (name: string) =>
      resolveSchema(
        spec,
        spec.paths[contributorsPath(name)]?.get?.responses['200']?.content['application/json']
          ?.schema,
      );
    const itemOf = (name: string) =>
      resolveSchema(spec, resolveSchema(spec, responseOf(name)?.properties?.data)?.items);
    return {
      operation: spec.paths[contributorsPath('organization-dependency')]?.get,
      body: responseOf('organization-dependency'),
      item: itemOf('organization-dependency'),
      leaderboardItem: itemOf('organization-leaderboard'),
    };
  }

  it('declares exactly the shared filters and flags, and no page params', async () => {
    const { operation } = await getSpec();
    const names = operation?.parameters
      ?.filter((param) => param.in === 'query')
      .map((param) => param.name)
      .sort();
    expect(names).toEqual([
      'activityType',
      'endDate',
      'includeCodeContributions',
      'includeCollaborations',
      'platform',
      'repos',
      'startDate',
    ]);
  });

  it('types both groups with an integer count and a numeric share, and nothing else', async () => {
    const { body } = await getSpec();
    expect(Object.keys(body?.properties ?? {}).sort()).toEqual([
      'data',
      'otherOrganizations',
      'topOrganizations',
    ]);
    for (const group of ['topOrganizations', 'otherOrganizations']) {
      const properties = body?.properties?.[group]?.properties;
      expect(Object.keys(properties ?? {}).sort(), group).toEqual([
        'contributionPercentage',
        'count',
      ]);
      expect(properties, group).toMatchObject({
        count: { type: 'integer' },
        contributionPercentage: { type: 'number' },
      });
    }
  });

  it("serves the organization leaderboard's item schema for data", async () => {
    const { item, leaderboardItem } = await getSpec();
    expect(item).toBeDefined();
    expect(item).toEqual(leaderboardItem);
  });
});
