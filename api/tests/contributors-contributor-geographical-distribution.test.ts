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
const pipePath = '/v0/pipes/contributors_geo_distribution.json';

// In the pipe's order, most contributors first. Unknown collects the contributors whose location
// names no country, so it can rank anywhere.
const pipeRows = [
  {
    country: 'United States',
    flag: '🇺🇸',
    country_code: 'US',
    contributorCount: 412,
    contributorPercentage: 31.5,
  },
  {
    country: 'Unknown',
    flag: '❓',
    country_code: 'XX',
    contributorCount: 380,
    contributorPercentage: 29.05,
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    country_code: 'DE',
    contributorCount: 97,
    contributorPercentage: 7.42,
  },
];

const expectedData = [
  {
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    contributors: 412,
    contributorPercentage: 31.5,
  },
  {
    country: 'Unknown',
    countryCode: 'XX',
    flag: '❓',
    contributors: 380,
    contributorPercentage: 29.05,
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    contributors: 97,
    contributorPercentage: 7.42,
  },
];

interface PipeRows {
  bucket?: object[];
  rows?: object[];
}

const routeTinybird = ({ bucket, rows = pipeRows }: PipeRows = {}) =>
  tinybirdStub(() => rows, bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/contributors/contributor-geographical-distribution?${queryString({
    startDate,
    endDate,
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/contributors/contributor-geographical-distribution (AC1)', () => {
  it('returns one entry per country with the renamed fields, in the pipe order', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: expectedData });
  });

  it('keeps a pipe order the route does not re-sort', async () => {
    const reversed = [...pipeRows].reverse();
    mockFetch.mockImplementation(routeTinybird({ rows: reversed }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [...expectedData].reverse() });
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ rows: pipeRows.map((row) => ({ ...row, timezone_offset: -4, extra: 'x' })) }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body)).toEqual(['data']);
    expect(body.data).toHaveLength(pipeRows.length);
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual([
        'contributorPercentage',
        'contributors',
        'country',
        'countryCode',
        'flag',
      ]);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes one contributors_geo_distribution call with the slug and the range', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(1);
    const call = calls[0];
    expect(call?.origin).toBe(tinybirdHost);
    expect(call?.pathname).toBe(pipePath);
    expect(call?.searchParams.get('project')).toBe('kubernetes');
    expect(call?.searchParams.get('startDate')).toBe(atMidnight(startDate));
    expect(call?.searchParams.get('endDate')).toBe(atMidnight(endDate));
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
    const res = await get(url({ platform: 'github', activityType: 'pull_request-opened' }));
    expect(res.statusCode).toBe(200);
    const call = pipeCalls()[0];
    expect(call?.searchParams.get('platform')).toBe('github');
    expect(call?.searchParams.get('activity_type')).toBe('pull_request-opened');
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

describe('Tinybird failures (AC3)', () => {
  const valid = pipeRows[2]!;
  const { contributorCount, contributorPercentage, ...location } = valid;
  it.each([
    ['without the country', { ...valid, country: undefined }],
    ['with a null country', { ...valid, country: null }],
    ['without the flag', { ...valid, flag: undefined }],
    ['with a numeric flag', { ...valid, flag: 1 }],
    ['without the country code', { ...valid, country_code: undefined }],
    ['with a null country code', { ...valid, country_code: null }],
    ['without the contributor count', { ...valid, contributorCount: undefined }],
    ['with a fractional contributor count', { ...valid, contributorCount: 2.5 }],
    ['with a negative contributor count', { ...valid, contributorCount: -1 }],
    ['with a string contributor count', { ...valid, contributorCount: '97' }],
    ['without the contributor percentage', { ...valid, contributorPercentage: undefined }],
    ['with a null contributor percentage', { ...valid, contributorPercentage: null }],
    ['with a string contributor percentage', { ...valid, contributorPercentage: 'high' }],
    [
      'with the organization columns in place of the contributor ones',
      {
        ...location,
        organizationCount: contributorCount,
        organizationPercentage: contributorPercentage,
      },
    ],
  ])('maps a pipe row %s to 503 upstream_unavailable', async (_case, row) => {
    mockFetch.mockImplementation(routeTinybird({ rows: [...pipeRows, row] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('high');
  });
});

describe('empty results (AC4)', () => {
  it('answers an empty list for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    vi.restoreAllMocks();
  });

  it('answers an empty list when no contributor was active in the period', async () => {
    mockFetch.mockImplementation(routeTinybird({ rows: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
  });
});

describe('OpenAPI (AC5)', () => {
  async function getSpec() {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const spec = res.json<OpenApiDoc>();
    const operation = spec.paths[contributorsPath('contributor-geographical-distribution')]?.get;
    const body = resolveSchema(
      spec,
      operation?.responses['200']?.content['application/json']?.schema,
    );
    const data = resolveSchema(spec, body?.properties?.data);
    const item = resolveSchema(spec, data?.items);
    return { operation, body, data, item };
  }

  it('declares exactly the shared filters and flags, with no pagination or granularity', async () => {
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

  it('answers an object holding only the data list', async () => {
    const { body, data } = await getSpec();
    expect(Object.keys(body?.properties ?? {})).toEqual(['data']);
    expect(data).toMatchObject({ type: 'array' });
  });

  it('types every item field', async () => {
    const { item } = await getSpec();
    expect(Object.keys(item?.properties ?? {}).sort()).toEqual([
      'contributorPercentage',
      'contributors',
      'country',
      'countryCode',
      'flag',
    ]);
    expect(item?.properties?.country).toMatchObject({ type: 'string' });
    expect(item?.properties?.countryCode).toMatchObject({ type: 'string' });
    expect(item?.properties?.flag).toMatchObject({ type: 'string' });
    expect(item?.properties?.contributors).toMatchObject({ type: 'integer' });
    expect(item?.properties?.contributorPercentage).toMatchObject({ type: 'number' });
  });
});
