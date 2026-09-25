// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Env } from '../src/env';
import { fetchMemberTiers } from '../src/tiers';

const env = {
  LFX_API_URL: 'https://lfx-api.test/',
  M2M_ISSUER_URL: 'https://auth.test/',
  M2M_AUDIENCE: 'https://lfx-api.test/',
  M2M_CLIENT_ID: 'client',
  M2M_CLIENT_SECRET: 'secret',
} as Env;

afterEach(() => vi.unstubAllGlobals());

describe('fetchMemberTiers', () => {
  it('calls member-tiers with an M2M token and reuses the token', async () => {
    const tiers = [{ b2b_org_uid: 'org', membership_uid: 'm', tier: 'gold' }];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) =>
      String(input).startsWith('https://auth.test/')
        ? Response.json({ access_token: 'm2m-token', expires_in: 86400 })
        : Response.json(tiers),
    );
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchMemberTiers('jane doe', env)).toEqual(tiers);
    await fetchMemberTiers('jane doe', env);

    const urls = fetchMock.mock.calls.map(([input]) => String(input));
    expect(urls).toEqual([
      'https://auth.test/oauth/token',
      'https://lfx-api.test/b2b_orgs/member-tiers/jane%20doe?v=1',
      'https://lfx-api.test/b2b_orgs/member-tiers/jane%20doe?v=1',
    ]);
    const init = fetchMock.mock.calls[1]![1]!;
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer m2m-token');
  });

  it('throws when member-tiers rejects the call', async () => {
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) =>
      String(input).startsWith('https://auth.test/')
        ? Response.json({ access_token: 'm2m-token', expires_in: 86400 })
        : new Response('forbidden', { status: 403 }),
    );
    await expect(fetchMemberTiers('jane', env)).rejects.toThrow('member-tiers request failed: 403');
  });
});
