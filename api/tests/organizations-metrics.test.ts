// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  tinybirdError,
  resolveSchema,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const route = '/v1-alpha/organizations/microsoft/metrics';
const pipePath = '/v0/pipes/org_page_kpis.json';
const profilePath = '/v0/pipes/org_page_profile.json';

const kpisRow = {
  activeContributors: 1200,
  activeContributorsTrend: 20,
  activeContributorsTrendAbsolute: 200,
  activeContributorsTrendPrevious: 1000,
  maintainerRoles: 85,
  criticalProjects: 340,
};

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

let kpis: unknown[] = [];
let profile: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  kpis = [kpisRow];
  profile = [profileRow];
  mockFetch.mockImplementation(
    tinybirdStub((url) => (url.pathname === profilePath ? profile : kpis)),
  );
});

describe('GET /v1-alpha/organizations/{slug}/metrics', () => {
  it('returns the KPI row', async () => {
    const response = await get(route);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      activeContributorCount: 1200,
      previousActiveContributorCount: 1000,
      activeContributorChange: 200,
      activeContributorChangePercent: 20,
      maintainerRoleCount: 85,
      criticalProjectCount: 340,
    });
  });

  it('reads the KPIs by slug without a profile lookup', async () => {
    await get(route);

    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get('orgSlug')).toBe('microsoft');
    expect(callsTo(profilePath)).toHaveLength(0);
  });

  it('returns a negative change when fewer people contributed', async () => {
    kpis = [
      {
        ...kpisRow,
        activeContributors: 900,
        activeContributorsTrend: -10,
        activeContributorsTrendAbsolute: -100,
      },
    ];

    const body = (await get(route)).json();

    expect(body.activeContributorChange).toBe(-100);
    expect(body.activeContributorChangePercent).toBe(-10);
  });

  it('returns a 0 percent change when there was no previous activity', async () => {
    kpis = [
      {
        ...kpisRow,
        activeContributors: 50,
        activeContributorsTrend: 0,
        activeContributorsTrendAbsolute: 50,
        activeContributorsTrendPrevious: 0,
      },
    ];

    const body = (await get(route)).json();

    expect(body.activeContributorChange).toBe(50);
    expect(body.activeContributorChangePercent).toBe(0);
  });

  it('returns zeros for a known organization without a KPI row', async () => {
    kpis = [];

    const response = await get(route);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      activeContributorCount: 0,
      previousActiveContributorCount: 0,
      activeContributorChange: 0,
      activeContributorChangePercent: 0,
      maintainerRoleCount: 0,
      criticalProjectCount: 0,
    });
    expect(callsTo(profilePath)[0]?.searchParams.get('orgSlug')).toBe('microsoft');
  });

  it('returns 404 for an unknown or blocked organization', async () => {
    kpis = [];
    profile = [];

    expect((await get(route)).statusCode).toBe(404);
  });

  it('returns 503 when the KPI pipe fails', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => tinybirdError(500)));

    const response = await get(route);

    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('tinybird internal detail');
  });

  it('returns 503 when the profile lookup fails', async () => {
    kpis = [];
    mockFetch.mockImplementation(
      tinybirdStub((url) => (url.pathname === profilePath ? tinybirdError(500) : kpis)),
    );

    expect((await get(route)).statusCode).toBe(503);
  });

  it.each([
    ['a negative contributor count', { activeContributors: -1 }],
    ['a fractional maintainer role count', { maintainerRoles: 1.5 }],
    ['a string project count', { criticalProjects: '340' }],
    ['a change that does not match the counts', { activeContributorsTrendAbsolute: 199 }],
    ['a non-numeric percent change', { activeContributorsTrend: 'NaN' }],
    [
      'a negative previous count',
      { activeContributorsTrendPrevious: -5, activeContributorsTrendAbsolute: 1205 },
    ],
  ])('returns 503 for %s', async (_name, change) => {
    kpis = [{ ...kpisRow, ...change }];

    expect((await get(route)).statusCode).toBe(503);
  });

  it('is listed in the OpenAPI document under Organizations', async () => {
    const doc = (await get('/v1-alpha/openapi.json')).json() as OpenApiDoc;
    const operation = doc.paths['/v1-alpha/organizations/{slug}/metrics']?.get;

    expect(operation?.tags).toEqual(['Organizations']);
    expect(operation?.summary).toBeTruthy();
  });

  it('publishes the bounds the row guard enforces', async () => {
    const doc = (await get('/v1-alpha/openapi.json')).json() as OpenApiDoc;
    const response = doc.paths['/v1-alpha/organizations/{slug}/metrics']?.get?.responses['200'];
    const properties = resolveSchema(
      doc,
      response?.content['application/json']?.schema,
    )?.properties;

    for (const count of [
      'activeContributorCount',
      'previousActiveContributorCount',
      'maintainerRoleCount',
      'criticalProjectCount',
    ]) {
      expect(properties?.[count]).toMatchObject({ type: 'integer', minimum: 0 });
    }
    expect(properties?.activeContributorChangePercent).toMatchObject({ type: 'number' });
    expect(properties?.activeContributorChange).toMatchObject({ type: 'integer' });
    expect(properties?.activeContributorChange).not.toHaveProperty('minimum');
  });
});
