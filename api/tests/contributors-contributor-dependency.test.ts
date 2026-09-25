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
const dependencyPath = '/v0/pipes/contributor_dependency.json';
const leaderboardPath = '/v0/pipes/contributors_leaderboard.json';

const dependencyRow = (id: string, contributionPercentageRunningTotal: number) => ({
  id,
  displayName: `Member ${id}`,
  githubHandleArray: [],
  contributionCount: 100,
  contributionPercentage: 10,
  roles: [],
  contributionPercentageRunningTotal,
  totalContributorCount: 40,
});

// The pipe orders by running total, but Insights found the order unreliable, so these come shuffled.
const dependencyRows = [
  dependencyRow('b', 38.9),
  dependencyRow('c', 52.35),
  dependencyRow('a', 21.4),
];

const leaderboardRow = (id: string, contributionCount: number, contributionPercentage: number) => ({
  id,
  avatar: `https://avatars.test/${id}.png`,
  displayName: `Member ${id}`,
  githubHandleArray: [`handle-${id}`],
  contributionCount,
  contributionPercentage,
  roles: ['maintainer'],
});

const leaderboardRows = [
  leaderboardRow('a', 214, 21.4),
  leaderboardRow('b', 175, 17.5),
  leaderboardRow('c', 134, 13.45),
  leaderboardRow('d', 90, 9),
  leaderboardRow('e', 41, 4.1),
];

const expectedData = leaderboardRows.map((row) => ({
  name: row.displayName,
  avatar: row.avatar,
  contributions: row.contributionCount,
  contributionPercentage: row.contributionPercentage,
  roles: row.roles,
  githubHandles: row.githubHandleArray,
}));

const emptyBody = {
  topContributors: { count: 0, contributionPercentage: 0 },
  otherContributors: { count: 0, contributionPercentage: 0 },
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
  `/v1-alpha/projects/${slug}/contributors/contributor-dependency?${queryString({
    startDate,
    endDate,
    ...params,
  })}`;

const bothCalls = () => [callsTo(dependencyPath)[0], callsTo(leaderboardPath)[0]];

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/contributors/contributor-dependency (AC1, AC2)', () => {
  it('returns the top group, everyone else and the top five with the renamed fields', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      topContributors: { count: 3, contributionPercentage: 52.35 },
      otherContributors: { count: 37, contributionPercentage: 47.65 },
      data: expectedData,
    });
  });

  it('takes the top share from the largest running total whatever order the rows come in', async () => {
    for (const rows of [dependencyRows, [...dependencyRows].reverse()]) {
      mockFetch.mockReset().mockImplementation(routeTinybird({ dependency: rows }));
      const res = await get(url());
      expect(res.statusCode).toBe(200);
      expect(res.json().topContributors).toEqual({ count: 3, contributionPercentage: 52.35 });
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
      topContributors: { count: 2, contributionPercentage: 51.37 },
      otherContributors: { count: 38, contributionPercentage: 48.63 },
    });
  });

  it('floors otherContributors.count at 0 when the total is below the top group', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        dependency: dependencyRows.map((row) => ({ ...row, totalContributorCount: 2 })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().otherContributors.count).toBe(0);
  });

  it('reads only the two group columns of a dependency row', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        dependency: [{ contributionPercentageRunningTotal: 64.5, totalContributorCount: 9 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      topContributors: { count: 1, contributionPercentage: 64.5 },
      otherContributors: { count: 8, contributionPercentage: 35.5 },
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

// contributors_leaderboard picks its rows by count, then member id, both descending, but its last
// node sorts by count alone, so tied rows can come back in any order.
describe('top five (AC4)', () => {
  it("lists the leaderboard rows in the leaderboard's rank order, restoring a shuffled tie", async () => {
    const top = leaderboardRow('11111111-1111-4111-8111-111111111111', 10, 20);
    const tieFirst = leaderboardRow('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 5, 10);
    const tieLast = leaderboardRow('55555555-5555-4555-8555-555555555555', 5, 10);
    mockFetch.mockImplementation(routeTinybird({ leaderboard: [tieLast, top, tieFirst] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json<{ data: { name: string }[] }>().data.map((item) => item.name)).toEqual(
      [top, tieFirst, tieLast].map((row) => row.displayName),
    );
  });
});

describe('Tinybird calls (AC5)', () => {
  it('makes one contributor_dependency call over the top 100 and one contributors_leaderboard call for the top five', async () => {
    await get(url());
    expect(pipeCalls()).toHaveLength(2);
    expect(callsTo(dependencyPath)).toHaveLength(1);
    expect(callsTo(leaderboardPath)).toHaveLength(1);
    const [dependency, leaderboard] = bothCalls();
    expect(dependency?.searchParams.get('limit')).toBe('100');
    expect(dependency?.searchParams.has('offset')).toBe(false);
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
    ['without the contributor total', { ...valid, totalContributorCount: undefined }],
    ['with a fractional contributor total', { ...valid, totalContributorCount: 2.5 }],
    ['with a negative contributor total', { ...valid, totalContributorCount: -1 }],
    ['with a string contributor total', { ...valid, totalContributorCount: 'many' }],
  ])('maps a contributor_dependency row %s to 503 upstream_unavailable', async (_case, row) => {
    mockFetch.mockImplementation(routeTinybird({ dependency: [...dependencyRows, row] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('many');
  });

  it('maps a contributors_leaderboard row the leaderboard guard rejects to 503', async () => {
    const negative = { ...leaderboardRow('f', 1, 0.1), contributionCount: -1 };
    mockFetch.mockImplementation(routeTinybird({ leaderboard: [...leaderboardRows, negative] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });
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
      operation: spec.paths[contributorsPath('contributor-dependency')]?.get,
      body: responseOf('contributor-dependency'),
      item: itemOf('contributor-dependency'),
      leaderboardItem: itemOf('contributor-leaderboard'),
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

  it('types both groups with an integer count and a numeric share', async () => {
    const { body } = await getSpec();
    expect(Object.keys(body?.properties ?? {}).sort()).toEqual([
      'data',
      'otherContributors',
      'topContributors',
    ]);
    for (const group of ['topContributors', 'otherContributors']) {
      expect(body?.properties?.[group]?.properties, group).toMatchObject({
        count: { type: 'integer' },
        contributionPercentage: { type: 'number' },
      });
    }
  });

  it("serves the contributor leaderboard's item schema for data", async () => {
    const { item, leaderboardItem } = await getSpec();
    expect(item).toBeDefined();
    expect(item).toEqual(leaderboardItem);
  });
});
