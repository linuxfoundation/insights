// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { localKeys, sign, useAuthApp } from './helpers/auth.js';
import { mockFetch, tinybirdHost, tinybirdStub } from './helpers/tinybird.js';

const organizationRoute = '/v1-alpha/organizations/microsoft';
const gold = { 'x-tier': 'gold' };
const microsoftRow = {
  id: '0f7c5c1e-0000-4000-8000-000000000001',
  displayName: 'Microsoft',
  logo: '',
  employeeCount: '',
  industry: '',
  description: '',
  website: '',
  domain: '',
  membership: 'Platinum',
};

const forbiddenBody = {
  statusCode: 403,
  code: 'tier_forbidden',
  error: 'Forbidden',
  message: 'This endpoint requires the premium tier',
};

describe('premium-only organization endpoints', () => {
  const get = useAuthApp(
    { authKeys: localKeys },
    { API_TB_HOST: tinybirdHost, API_TB_TOKEN: 'test-token' },
  );
  let jdoe: string;

  beforeEach(async () => {
    jdoe = `Bearer ${await sign()}`;
    mockFetch.mockImplementation(tinybirdStub(() => [microsoftRow]));
  });

  it('answers 403 to a caller without a tier, before any upstream call', async () => {
    const response = await get(organizationRoute, jdoe);

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual(forbiddenBody);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('serves a caller the Worker sends a tier for', async () => {
    const response = await get(organizationRoute, jdoe, gold);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ slug: 'microsoft', name: 'Microsoft' });
  });

  it('answers 401 to a missing token before checking the tier', async () => {
    expect((await get(organizationRoute)).statusCode).toBe(401);
  });

  it('leaves other endpoints open to a caller without a tier', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => []));

    const response = await get('/v1-alpha/projects/kubernetes', jdoe);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: 'not_found' });
  });

  it('is skipped while auth is disabled', async () => {
    vi.stubEnv('API_AUTH_DISABLED', 'true');

    expect((await get(organizationRoute)).statusCode).toBe(200);
  });
});
