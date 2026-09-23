// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  atDate,
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
const pipePath = '/v0/pipes/contributors_leaderboard.json';

// Rows as the pipe returns them: `id` is the member id the pipe pages by, which the route drops.
const pipeRows = [
  {
    id: 'b17e3beb-09e2-447f-a12d-00c716dd00db',
    avatar: 'https://avatars.githubusercontent.com/u/6732289?v=4',
    displayName: 'Jakub Kicinski',
    githubHandleArray: ['kuba-moo'],
    contributionCount: 9234,
    contributionPercentage: 3.12,
    roles: ['maintainer'],
  },
  {
    id: 'a3bbff07-7cec-4885-b688-d8b377a580c6',
    avatar: 'https://avatars.githubusercontent.com/u/118310711?v=4',
    displayName: 'Alex Deucher',
    githubHandleArray: ['alexdeucher', 'agd5f'],
    contributionCount: 6625,
    contributionPercentage: 2.24,
    roles: ['maintainer', 'contributor'],
  },
  {
    id: '7f65feb0-589b-11ee-bf26-d732180a3416',
    avatar: '',
    displayName: 'Mark Brown',
    githubHandleArray: [],
    contributionCount: 5584,
    contributionPercentage: 1.89,
    roles: [],
  },
];

const expectedData = [
  {
    name: 'Jakub Kicinski',
    avatar: 'https://avatars.githubusercontent.com/u/6732289?v=4',
    contributions: 9234,
    contributionPercentage: 3.12,
    roles: ['maintainer'],
    githubHandles: ['kuba-moo'],
  },
  {
    name: 'Alex Deucher',
    avatar: 'https://avatars.githubusercontent.com/u/118310711?v=4',
    contributions: 6625,
    contributionPercentage: 2.24,
    roles: ['maintainer', 'contributor'],
    githubHandles: ['alexdeucher', 'agd5f'],
  },
  {
    name: 'Mark Brown',
    avatar: '',
    contributions: 5584,
    contributionPercentage: 1.89,
    roles: [],
    githubHandles: [],
  },
];

const pipeRow = (id: string, contributionCount: number) => ({
  id,
  avatar: `https://avatars.test/${id}.png`,
  displayName: `Member ${id}`,
  githubHandleArray: [],
  contributionCount,
  contributionPercentage: 1,
  roles: [],
});

interface PipeRows {
  bucket?: object[];
  rows?: object[];
}

const routeTinybird = ({ bucket, rows = pipeRows }: PipeRows = {}) =>
  tinybirdStub(() => rows, bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/contributors/contributor-leaderboard?${queryString({
    startDate,
    endDate,
    ...params,
  })}`;

interface Page {
  data: { name: string }[];
  pageSize: number;
  nextCursor: string | null;
}

const namesOf = (page: Page) => page.data.map((item) => item.name);

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/contributors/contributor-leaderboard (AC1)', () => {
  it('returns a page of contributors with the renamed fields', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: expectedData, pageSize: 50, nextCursor: null });
  });

  it('returns only the documented keys, dropping the member id and extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ rows: pipeRows.map((row) => ({ ...row, slug: 'x', extra: 'x' })) }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'nextCursor', 'pageSize']);
    expect(body.data).toHaveLength(pipeRows.length);
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual([
        'avatar',
        'contributionPercentage',
        'contributions',
        'githubHandles',
        'name',
        'roles',
      ]);
    }
    expect(res.body).not.toContain(pipeRows[0]!.id);
  });

  it('answers empty roles and githubHandles when the pipe sends null or leaves them out', async () => {
    const withoutLists = {
      id: 'b',
      avatar: 'https://avatars.test/b.png',
      displayName: 'Member b',
      contributionCount: 5,
      contributionPercentage: 1,
    };
    mockFetch.mockImplementation(
      routeTinybird({
        rows: [{ ...pipeRow('c', 9), roles: null, githubHandleArray: null }, withoutLists],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const { data } = res.json<{ data: object[] }>();
    expect(data).toHaveLength(2);
    for (const item of data) {
      expect(item).toMatchObject({ roles: [], githubHandles: [] });
    }
  });

  it('keeps an empty avatar as an empty string rather than null', async () => {
    mockFetch.mockImplementation(routeTinybird({ rows: [{ ...pipeRow('a', 3), avatar: '' }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data[0].avatar).toBe('');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes one contributors_leaderboard call with the slug and the range, never the count-only one', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(1);
    const call = calls[0];
    expect(call?.origin).toBe(tinybirdHost);
    expect(call?.pathname).toBe(pipePath);
    expect(call?.searchParams.get('project')).toBe('kubernetes');
    expect(call?.searchParams.get('startDate')).toBe(atMidnight(startDate));
    expect(call?.searchParams.get('endDate')).toBe(atMidnight(endDate));
    expect(call?.searchParams.has('count')).toBe(false);
  });

  it('counts code contributions and leaves collaborations out by default', async () => {
    await get(url());
    const call = pipeCalls()[0];
    expect(call?.searchParams.get('includeCodeContributions')).toBe('true');
    expect(call?.searchParams.get('includeCollaborations')).toBe('false');
  });

  it('forwards both contribution flags when the caller sets them', async () => {
    const res = await get(
      url({ includeCodeContributions: 'false', includeCollaborations: 'true' }),
    );
    expect(res.statusCode).toBe(200);
    const call = pipeCalls()[0];
    expect(call?.searchParams.get('includeCodeContributions')).toBe('false');
    expect(call?.searchParams.get('includeCollaborations')).toBe('true');
  });

  it('sends no platform or activity type filter when the caller omits them', async () => {
    await get(url());
    const call = pipeCalls()[0];
    expect(call?.searchParams.has('platform')).toBe(false);
    expect(call?.searchParams.has('activity_type')).toBe(false);
    expect(call?.searchParams.has('activityType')).toBe(false);
  });

  it('forwards platform as platform and activityType as the activity_type the pipe reads', async () => {
    const res = await get(url({ platform: 'git', activityType: 'authored-commit' }));
    expect(res.statusCode).toBe(200);
    const call = pipeCalls()[0];
    expect(call?.searchParams.get('platform')).toBe('git');
    expect(call?.searchParams.get('activity_type')).toBe('authored-commit');
    expect(call?.searchParams.has('activityType')).toBe(false);
  });

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      const call = pipeCalls()[0];
      expect(call?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(call?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });
});

// The pipe pages by contribution count, then member id, both descending, but its last node sorts
// by count alone, so tied rows can come back in any order.
describe('rank order (AC3)', () => {
  it('restores the paging order of a tie at the page boundary and drops the lookahead row', async () => {
    const top = pipeRow('11111111-1111-4111-8111-111111111111', 10);
    const tieFirst = pipeRow('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 5);
    const tieLast = pipeRow('55555555-5555-4555-8555-555555555555', 5);
    mockFetch.mockImplementation(routeTinybird({ rows: [top, tieLast, tieFirst] }));
    const res = await get(url({ pageSize: '2' }));
    expect(res.statusCode).toBe(200);
    const page = res.json<Page>();
    expect(namesOf(page)).toEqual([top.displayName, tieFirst.displayName]);
    expect(page.nextCursor).toEqual(expect.any(String));
  });

  // memberId is a String column, which ClickHouse orders by its bytes. A UUID column would order
  // by the second half first, which puts these two the other way round.
  it('breaks a tie by the member id in string order, not UUID order', async () => {
    const firstAsString = pipeRow('ffffffff-ffff-4fff-8000-000000000000', 5);
    const firstAsUuid = pipeRow('00000000-0000-4000-bfff-ffffffffffff', 5);
    mockFetch.mockImplementation(routeTinybird({ rows: [firstAsUuid, firstAsString] }));
    const res = await get(url({ pageSize: '1' }));
    expect(res.statusCode).toBe(200);
    const page = res.json<Page>();
    expect(namesOf(page)).toEqual([firstAsString.displayName]);
    expect(page.nextCursor).toEqual(expect.any(String));
  });

  it('keeps every tied row of a last page in the paging order', async () => {
    const rows = [
      pipeRow('22222222-2222-4222-8222-222222222222', 7),
      pipeRow('99999999-9999-4999-8999-999999999999', 7),
      pipeRow('44444444-4444-4444-8444-444444444444', 7),
    ];
    mockFetch.mockImplementation(routeTinybird({ rows }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const page = res.json<Page>();
    expect(namesOf(page)).toEqual([rows[1]!, rows[2]!, rows[0]!].map((row) => row.displayName));
    expect(page.nextCursor).toBeNull();
  });
});

describe('Tinybird failures (AC4)', () => {
  const valid = pipeRow('ab', 4);
  it.each([
    ['without the member id', { ...valid, id: undefined }],
    ['with a numeric member id', { ...valid, id: 42 }],
    ['without the display name', { ...valid, displayName: undefined }],
    ['with a null avatar', { ...valid, avatar: null }],
    ['without the contribution count', { ...valid, contributionCount: undefined }],
    ['with a fractional contribution count', { ...valid, contributionCount: 2.5 }],
    ['with a string contribution count', { ...valid, contributionCount: '4' }],
    ['with a negative contribution count', { ...valid, contributionCount: -1 }],
    ['without the contribution percentage', { ...valid, contributionPercentage: undefined }],
    ['with a string contribution percentage', { ...valid, contributionPercentage: 'high' }],
    ['with roles that are not a list', { ...valid, roles: 'maintainer' }],
    ['with a role that is not a string', { ...valid, roles: [1] }],
    ['with a GitHub handle that is not a string', { ...valid, githubHandleArray: [null] }],
  ])('maps a pipe row %s to 503 upstream_unavailable', async (_case, row) => {
    mockFetch.mockImplementation(routeTinybird({ rows: [...pipeRows, row] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('high');
  });
});

describe('empty results (AC5)', () => {
  it('answers an empty page with the requested pageSize for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({ pageSize: '20' }, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [], pageSize: 20, nextCursor: null });
    vi.restoreAllMocks();
  });
});

describe('OpenAPI (AC6)', () => {
  async function getSpec() {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const spec = res.json<OpenApiDoc>();
    const operation = spec.paths[contributorsPath('contributor-leaderboard')]?.get;
    const page = resolveSchema(
      spec,
      operation?.responses['200']?.content['application/json']?.schema,
    );
    const item = resolveSchema(spec, resolveSchema(spec, page?.properties?.data)?.items);
    return { operation, item };
  }

  it('declares exactly the shared filters, flags and page params, and no sort', async () => {
    const { operation } = await getSpec();
    const names = operation?.parameters
      ?.filter((param) => param.in === 'query')
      .map((param) => param.name)
      .sort();
    expect(names).toEqual([
      'activityType',
      'cursor',
      'endDate',
      'includeCodeContributions',
      'includeCollaborations',
      'pageSize',
      'platform',
      'repos',
      'startDate',
    ]);
  });

  it('types every item field, with a non-nullable avatar and string lists', async () => {
    const { item } = await getSpec();
    expect(item?.properties?.name).toMatchObject({ type: 'string' });
    expect(item?.properties?.avatar).toMatchObject({ type: 'string' });
    expect(item?.properties?.avatar?.nullable).toBeFalsy();
    expect(item?.properties?.contributions).toMatchObject({ type: 'integer' });
    expect(item?.properties?.contributionPercentage).toMatchObject({ type: 'number' });
    for (const list of ['roles', 'githubHandles']) {
      expect(item?.properties?.[list], list).toMatchObject({
        type: 'array',
        items: { type: 'string' },
      });
    }
  });
});
