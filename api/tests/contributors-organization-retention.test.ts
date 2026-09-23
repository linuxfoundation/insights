// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import {
  atDate,
  contributorsPath,
  mockFetch,
  pipeCalls,
  queryString,
  tinybirdHost,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
} from './helpers/tinybird.js';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', retentionRate: 0 },
  { startDate: '2025-02-01', endDate: '2025-02-28', retentionRate: 66.67 },
  { startDate: '2025-03-01', endDate: '2025-03-31', retentionRate: 50 },
];

const expectedBody = {
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), retentionPercentage: 0 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), retentionPercentage: 66.67 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), retentionPercentage: 50 },
  ],
};

const routeTinybird = (rows: object[] = seriesRows, bucket?: object[]) =>
  tinybirdStub(() => rows, bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/contributors/organization-retention?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

describe('GET /v1-alpha/projects/{slug}/contributors/organization-retention (OR1)', () => {
  it('returns one bucket per granularity step, renaming retentionRate to retentionPercentage', async () => {
    mockFetch.mockImplementation(routeTinybird());
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(routeTinybird(seriesRows.map((row) => ({ ...row, extra: 'x' }))));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data']);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['endDate', 'retentionPercentage', 'startDate']);
    }
  });
});

describe('empty results (OR2)', () => {
  it('returns an empty data list when the pipe returns no rows, not a 500', async () => {
    mockFetch.mockImplementation(routeTinybird([]));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
  });
});

describe('Tinybird calls (OR3)', () => {
  it('makes a single organization_retention call with the slug as project and both flags at their defaults', async () => {
    mockFetch.mockImplementation(routeTinybird());
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call.origin).toBe(tinybirdHost);
    expect(call.pathname).toBe('/v0/pipes/organization_retention.json');
    expect(call.searchParams.get('project')).toBe('kubernetes');
    expect(call.searchParams.get('includeCodeContributions')).toBe('true');
    expect(call.searchParams.get('includeCollaborations')).toBe('false');
    expect(call.searchParams.get('granularity')).toBe('monthly');
    expect(call.searchParams.get('startDate')).toBe(atMidnight(startDate));
    expect(call.searchParams.get('endDate')).toBe(atMidnight(endDate));
  });

  it('sends activityType as activity_type', async () => {
    mockFetch.mockImplementation(routeTinybird());
    await get(url({ activityType: 'authored-commit' }));
    expect(pipeCalls()[0]?.searchParams.get('activity_type')).toBe('authored-commit');
  });

  it('passes includeCodeContributions=false and includeCollaborations=true through', async () => {
    mockFetch.mockImplementation(routeTinybird());
    await get(url({ includeCodeContributions: 'false', includeCollaborations: 'true' }));
    const [call] = pipeCalls();
    expect(call.searchParams.get('includeCodeContributions')).toBe('false');
    expect(call.searchParams.get('includeCollaborations')).toBe('true');
  });

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    mockFetch.mockImplementation(routeTinybird());
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      const [call] = pipeCalls();
      expect(call.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(call.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });
});

async function getOperation(): Promise<OpenApiOperation | undefined> {
  const res = await get('/v1-alpha/openapi.json');
  expect(res.statusCode).toBe(200);
  return res.json<OpenApiDoc>().paths[contributorsPath('organization-retention')]?.get;
}

describe('OpenAPI (OR4)', () => {
  it('publishes the range, granularity, activityType, repos and both flags as query parameters', async () => {
    const operation = await getOperation();
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(
      [
        'activityType',
        'endDate',
        'granularity',
        'includeCodeContributions',
        'includeCollaborations',
        'repos',
        'startDate',
      ].sort(),
    );
  });

  it('types retentionPercentage as a number', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.properties?.data?.items?.properties?.retentionPercentage?.type).toBe('number');
  });
});
