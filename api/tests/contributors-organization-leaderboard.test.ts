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
const pipePath = '/v0/pipes/organizations_leaderboard.json';

// Rows as the pipe returns them: `id` is the organization id the pipe pages by, which the route drops.
const pipeRows = [
  {
    id: 'd7bf07d9-780b-4279-bfbc-d83f85950353',
    slug: 'red-hat-inc',
    logo: 'https://logos.test/red-hat.svg',
    displayName: 'Red Hat, Inc.',
    contributionCount: 16593,
    contributionPercentage: 12.04,
  },
  {
    id: '9f7f73b0-95d6-49c2-bffe-8300c03852ef',
    slug: 'linaro-limited',
    logo: 'https://logos.test/linaro.svg',
    displayName: 'Linaro Limited',
    contributionCount: 13560,
    contributionPercentage: 9.84,
  },
  {
    id: '0c562f29-ab29-4383-b4ca-85457367ee39',
    slug: 'arm-limited',
    logo: '',
    displayName: 'Arm Limited',
    contributionCount: 9996,
    contributionPercentage: 7.25,
  },
];

const expectedData = [
  {
    name: 'Red Hat, Inc.',
    slug: 'red-hat-inc',
    logo: 'https://logos.test/red-hat.svg',
    contributions: 16593,
    contributionPercentage: 12.04,
  },
  {
    name: 'Linaro Limited',
    slug: 'linaro-limited',
    logo: 'https://logos.test/linaro.svg',
    contributions: 13560,
    contributionPercentage: 9.84,
  },
  {
    name: 'Arm Limited',
    slug: 'arm-limited',
    logo: '',
    contributions: 9996,
    contributionPercentage: 7.25,
  },
];

const pipeRow = (id: string, contributionCount: number, displayName = `Organization ${id}`) => ({
  id,
  slug: `organization-${id}`,
  logo: `https://logos.test/${id}.png`,
  displayName,
  contributionCount,
  contributionPercentage: 1,
});

interface PipeRows {
  bucket?: object[];
  rows?: object[];
}

const routeTinybird = ({ bucket, rows = pipeRows }: PipeRows = {}) =>
  tinybirdStub(() => rows, bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/contributors/organization-leaderboard?${queryString({
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

describe('GET /v1-alpha/projects/{slug}/contributors/organization-leaderboard (AC1)', () => {
  it('returns a page of organizations with the renamed fields', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: expectedData, pageSize: 50, nextCursor: null });
  });

  it('returns only the documented keys, dropping the organization id, website and extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        rows: pipeRows.map((row) => ({ ...row, website: 'https://site.test', extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'nextCursor', 'pageSize']);
    expect(body.data).toHaveLength(pipeRows.length);
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual([
        'contributionPercentage',
        'contributions',
        'logo',
        'name',
        'slug',
      ]);
    }
    expect(res.body).not.toContain(pipeRows[0]!.id);
    expect(res.body).not.toContain('https://site.test');
  });

  it('keeps an empty logo as an empty string rather than null', async () => {
    mockFetch.mockImplementation(routeTinybird({ rows: [{ ...pipeRow('a', 3), logo: '' }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data[0].logo).toBe('');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes one organizations_leaderboard call with the slug and the range, never the count-only one', async () => {
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

// The pipe's only node orders by contribution count, then organization id, both descending, and
// pages that order, so rows already arrive in paging order.
describe('rank order (AC3)', () => {
  it('keeps the pipe order of a tie at the page boundary and drops the lookahead row', async () => {
    const top = pipeRow('11111111-1111-4111-8111-111111111111', 10, 'Top');
    const tieFirst = pipeRow('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 5, 'Zeta');
    const tieLast = pipeRow('55555555-5555-4555-8555-555555555555', 5, 'Alpha');
    mockFetch.mockImplementation(routeTinybird({ rows: [top, tieFirst, tieLast] }));
    const res = await get(url({ pageSize: '2' }));
    expect(res.statusCode).toBe(200);
    const page = res.json<Page>();
    expect(namesOf(page)).toEqual(['Top', 'Zeta']);
    expect(page.nextCursor).toEqual(expect.any(String));
  });

  it('keeps every tied row of a last page in the pipe order', async () => {
    const rows = [
      pipeRow('99999999-9999-4999-8999-999999999999', 7, 'Mid'),
      pipeRow('44444444-4444-4444-8444-444444444444', 7, 'Zulu'),
      pipeRow('22222222-2222-4222-8222-222222222222', 7, 'Able'),
    ];
    mockFetch.mockImplementation(routeTinybird({ rows }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const page = res.json<Page>();
    expect(namesOf(page)).toEqual(['Mid', 'Zulu', 'Able']);
    expect(page.nextCursor).toBeNull();
  });
});

describe('Tinybird failures (AC4)', () => {
  const valid = pipeRow('ab', 4);
  it.each([
    ['without the slug', { ...valid, slug: undefined }],
    ['with a numeric slug', { ...valid, slug: 42 }],
    ['with a null logo', { ...valid, logo: null }],
    ['without the display name', { ...valid, displayName: undefined }],
    ['without the contribution count', { ...valid, contributionCount: undefined }],
    ['with a fractional contribution count', { ...valid, contributionCount: 2.5 }],
    ['with a negative contribution count', { ...valid, contributionCount: -1 }],
    ['with a string contribution count', { ...valid, contributionCount: '4' }],
    ['without the contribution percentage', { ...valid, contributionPercentage: undefined }],
    ['with a string contribution percentage', { ...valid, contributionPercentage: 'high' }],
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
    const operation = spec.paths[contributorsPath('organization-leaderboard')]?.get;
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

  it('types every item field, with non-nullable identity strings', async () => {
    const { item } = await getSpec();
    expect(Object.keys(item?.properties ?? {}).sort()).toEqual([
      'contributionPercentage',
      'contributions',
      'logo',
      'name',
      'slug',
    ]);
    for (const text of ['name', 'slug', 'logo']) {
      expect(item?.properties?.[text], text).toMatchObject({ type: 'string' });
      expect(item?.properties?.[text]?.nullable, text).toBeFalsy();
    }
    expect(item?.properties?.contributions).toMatchObject({ type: 'integer' });
    expect(item?.properties?.contributionPercentage).toMatchObject({ type: 'number' });
  });
});
