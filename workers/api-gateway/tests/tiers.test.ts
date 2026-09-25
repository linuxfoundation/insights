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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

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
    const tokenInit = fetchMock.mock.calls[0]![1]!;
    expect(tokenInit.method).toBe('POST');
    expect(JSON.parse(String(tokenInit.body))).toEqual({
      grant_type: 'client_credentials',
      client_id: 'client',
      client_secret: 'secret',
      audience: 'https://lfx-api.test/',
    });
    const init = fetchMock.mock.calls[1]![1]!;
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer m2m-token');
  });

  it('fetches a new token once the cached one is inside the expiry margin', async () => {
    vi.useFakeTimers({ now: Date.now() + 2 * 86_400_000 });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
      String(input).startsWith('https://auth.test/')
        ? Response.json({ access_token: 'short-token', expires_in: 120 })
        : Response.json([]),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchMemberTiers('jane', env);
    await fetchMemberTiers('jane', env);
    vi.advanceTimersByTime(61_000);
    await fetchMemberTiers('jane', env);

    const tokenCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith('/oauth/token'),
    );
    expect(tokenCalls).toHaveLength(2);
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
