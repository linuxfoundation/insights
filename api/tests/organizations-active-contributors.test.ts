// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  tinybirdError,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const route = '/v1-alpha/organizations/microsoft/active-contributors';
const pipePath = '/v0/pipes/org_page_contributors_timeseries.json';
const profilePath = '/v0/pipes/org_page_profile.json';

const profileRow = {
  displayName: 'Microsoft',
  logo: '',
  employeeCount: '',
  industry: '',
  description: '',
  website: null,
  domain: null,
  membership: null,
};

let years: unknown[] = [];
let profile: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  // 2018 has no active contributors, so the pipe has no row for it.
  years = [
    { startDate: '2017-01-01', endDate: '2017-12-31', contributorCount: 120 },
    { startDate: '2019-01-01', endDate: '2019-12-31', contributorCount: 340 },
  ];
  profile = [profileRow];
  mockFetch.mockImplementation(
    tinybirdStub((url) => (url.pathname === profilePath ? profile : years)),
  );
});

describe('GET /v1-alpha/organizations/{slug}/active-contributors', () => {
  it('returns one entry per year with active contributors, as UTC date-times', async () => {
    const response = await get(route);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          startDate: '2017-01-01T00:00:00Z',
          endDate: '2017-12-31T00:00:00Z',
          contributors: 120,
        },
        {
          startDate: '2019-01-01T00:00:00Z',
          endDate: '2019-12-31T00:00:00Z',
          contributors: 340,
        },
      ],
    });
  });

  it('reads the series by slug without a profile lookup', async () => {
    await get(route);

    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get('orgSlug')).toBe('microsoft');
    expect(callsTo(profilePath)).toHaveLength(0);
  });

  it('returns an empty series for a known organization without active contributors', async () => {
    years = [];

    const response = await get(route);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: [] });
    expect(callsTo(profilePath)[0]?.searchParams.get('orgSlug')).toBe('microsoft');
  });

  it('returns 404 for an unknown or blocked organization', async () => {
    years = [];
    profile = [];

    expect((await get(route)).statusCode).toBe(404);
  });

  it('returns 503 when the pipe fails', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => tinybirdError(500)));

    const response = await get(route);

    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('tinybird internal detail');
  });

  it.each([
    ['a negative count', { contributorCount: -1 }],
    ['a string count', { contributorCount: '120' }],
    ['a date-time start', { startDate: '2017-01-01 00:00:00' }],
    ['a missing end', { endDate: null }],
  ])('returns 503 for %s', async (_name, change) => {
    years = [{ startDate: '2017-01-01', endDate: '2017-12-31', contributorCount: 120, ...change }];

    expect((await get(route)).statusCode).toBe(503);
  });

  it('is listed in the OpenAPI document under Organizations', async () => {
    const doc = (await get('/v1-alpha/openapi.json')).json() as OpenApiDoc;
    const operation = doc.paths['/v1-alpha/organizations/{slug}/active-contributors']?.get;

    expect(operation?.tags).toEqual(['Organizations']);
    expect(operation?.summary).toBeTruthy();
  });
});
