// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from 'vitest';

import type { Entitlement, EntitlementCache } from '../src/cache';
import type { Env } from '../src/env';
import { exchangePat, usernameFromJwt } from '../src/exchange';
import { handle, type Deps } from '../src/index';
import type { MemberOrgTier } from '../src/tiers';

const env: Env = {
  ORIGIN_URL: 'http://origin.test',
  WORKER_SECRET: 'worker-secret',
  PAT_HASH_SALT: 'salt',
  LFX_API_URL: 'https://lfx-api.test/',
  M2M_ISSUER_URL: 'https://auth.test/',
  M2M_AUDIENCE: 'https://lfx-api.test/',
  M2M_CLIENT_ID: 'client',
  M2M_CLIENT_SECRET: 'secret',
};

const goldTier: MemberOrgTier = {
  b2b_org_uid: '001B000000IqhSLIAZ',
  membership_uid: '02i2M000009ABCdIAM',
  tier: 'gold',
};
const fetchMemberTiers: Deps['fetchMemberTiers'] = async () => [goldTier];

function memoryCache(): EntitlementCache & { entries: Map<string, Entitlement> } {
  const entries = new Map<string, Entitlement>();
  return {
    entries,
    get: async (key) => entries.get(key),
    put: async (key, value) => void entries.set(key, value),
  };
}

function setup(memberTiers: Deps['fetchMemberTiers'] = fetchMemberTiers) {
  const deps = {
    cache: memoryCache(),
    exchangePat: vi.fn(exchangePat),
    fetchMemberTiers: vi.fn(memberTiers),
    callOrigin: vi.fn(async (_request: Request) => new Response('ok')),
  };
  const forwarded = () => deps.callOrigin.mock.calls[0]![0];
  return { deps, forwarded };
}

function apiRequest(headers: Record<string, string> = {}) {
  return new Request('https://api.insights.linuxfoundation.org/v1-alpha/projects/k8s?x=1', {
    headers: { authorization: 'Bearer lfi_abc123', ...headers },
  });
}

describe('api gateway', () => {
  it('rejects a request without a PAT', async () => {
    const { deps } = setup();
    const response = await handle(new Request('https://api.test/v1-alpha/x'), env, deps);

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ statusCode: 401, code: 'unauthorized' });
    expect(deps.callOrigin).not.toHaveBeenCalled();
  });

  it('rejects a bearer token without the lfi_ prefix', async () => {
    const { deps } = setup();
    const response = await handle(apiRequest({ authorization: 'Bearer eyJhbGci' }), env, deps);

    expect(response.status).toBe(401);
  });

  it('forwards to the origin with the exchanged JWT and Worker-set headers', async () => {
    const { deps, forwarded } = setup();
    await handle(apiRequest({ 'cf-connecting-ip': '203.0.113.7' }), env, deps);

    const request = forwarded();
    expect(request.url).toBe('http://origin.test/v1-alpha/projects/k8s?x=1');
    expect(usernameFromJwt(request.headers.get('authorization')!.replace('Bearer ', ''))).toBe(
      'stub-user',
    );
    expect(request.headers.get('x-worker-secret')).toBe('worker-secret');
    expect(request.headers.get('x-org-id')).toBe('001B000000IqhSLIAZ');
    expect(request.headers.get('x-tier')).toBe('gold');
    expect(request.headers.get('x-client-ip')).toBe('203.0.113.7');
    expect(request.redirect).toBe('manual');
  });

  it('overwrites client-supplied trusted headers', async () => {
    const { deps, forwarded } = setup();
    await handle(
      apiRequest({ 'x-tier': 'platinum', 'x-org-id': 'someone-else', 'x-worker-secret': 'guess' }),
      env,
      deps,
    );

    const headers = forwarded().headers;
    expect(headers.get('x-tier')).toBe('gold');
    expect(headers.get('x-org-id')).toBe('001B000000IqhSLIAZ');
    expect(headers.get('x-worker-secret')).toBe('worker-secret');
  });

  it('rejects a caller without an active membership and caches nothing', async () => {
    const { deps } = setup(async () => []);
    const response = await handle(apiRequest(), env, deps);

    expect(response.status).toBe(403);
    expect(deps.callOrigin).not.toHaveBeenCalled();
    expect(deps.cache.entries.size).toBe(0);
  });

  it('keeps the origin host for a path starting with //', async () => {
    const { deps, forwarded } = setup();
    await handle(
      new Request('https://api.test//attacker.example/x', {
        headers: { authorization: 'Bearer lfi_abc123' },
      }),
      env,
      deps,
    );

    expect(new URL(forwarded().url).host).toBe('origin.test');
  });

  it('caches the entitlement under a salted hash, never the raw PAT', async () => {
    const { deps } = setup();
    await handle(apiRequest(), env, deps);
    await handle(apiRequest(), env, deps);

    expect(deps.exchangePat).toHaveBeenCalledTimes(1);
    expect(deps.fetchMemberTiers).toHaveBeenCalledTimes(1);
    const [key] = deps.cache.entries.keys();
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).not.toContain('lfi_');
  });
});
