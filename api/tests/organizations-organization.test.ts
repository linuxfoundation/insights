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

const route = '/v1-alpha/organizations/microsoft';
const pipePath = '/v0/pipes/org_page_profile.json';

const microsoftRow = {
  id: '0f7c5c1e-0000-4000-8000-000000000001',
  displayName: 'Microsoft',
  logo: 'https://example.org/microsoft.png',
  employeeCount: '10001+',
  industry: 'software development, Cloud Computing ,',
  description: 'Technology company',
  website: 'https://microsoft.com',
  domain: 'microsoft.com',
  membership: 'Platinum',
};

let rows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  rows = [microsoftRow];
  mockFetch.mockImplementation(tinybirdStub(() => rows));
});

describe('GET /v1-alpha/organizations/{slug}', () => {
  it('returns the organization profile', async () => {
    const response = await get(route);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      slug: 'microsoft',
      name: 'Microsoft',
      logo: 'https://example.org/microsoft.png',
      description: 'Technology company',
      website: 'https://microsoft.com',
      domain: 'microsoft.com',
      employeeCount: '10001+',
      industries: ['software development', 'Cloud Computing'],
      membership: 'Platinum',
    });
  });

  it('looks the organization up by slug in one pipe call', async () => {
    await get(route);

    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get('orgSlug')).toBe('microsoft');
  });

  it('returns null and empty values for the fields the organization lacks', async () => {
    rows = [
      {
        ...microsoftRow,
        logo: '',
        description: '',
        employeeCount: '0',
        industry: '',
        website: null,
        domain: '',
        membership: null,
      },
    ];

    expect((await get(route)).json()).toEqual({
      slug: 'microsoft',
      name: 'Microsoft',
      logo: null,
      description: null,
      website: null,
      domain: null,
      employeeCount: null,
      industries: [],
      membership: null,
    });
  });

  it('returns null membership for an empty membership', async () => {
    rows = [{ ...microsoftRow, membership: '' }];

    expect((await get(route)).json().membership).toBeNull();
  });

  it('returns 404 for an unknown or blocked organization', async () => {
    rows = [];

    const response = await get(route);

    expect(response.statusCode).toBe(404);
    expect(callsTo(pipePath)).toHaveLength(1);
  });

  it('returns 503 when the pipe fails', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => tinybirdError(500)));

    const response = await get(route);

    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('tinybird internal detail');
  });

  it.each([
    ['a numeric name', { displayName: 42 }],
    ['a missing logo', { logo: undefined }],
    ['a numeric employee count', { employeeCount: 10001 }],
    ['an industry list instead of a string', { industry: ['software'] }],
    ['a numeric membership', { membership: 1 }],
  ])('returns 503 for %s', async (_name, change) => {
    rows = [{ ...microsoftRow, ...change }];

    expect((await get(route)).statusCode).toBe(503);
  });

  it('is listed in the OpenAPI document under Organizations', async () => {
    const doc = (await get('/v1-alpha/openapi.json')).json() as OpenApiDoc;
    const operation = doc.paths['/v1-alpha/organizations/{slug}']?.get;

    expect(operation?.tags).toEqual(['Organizations']);
    expect(operation?.summary).toBeTruthy();
  });
});
