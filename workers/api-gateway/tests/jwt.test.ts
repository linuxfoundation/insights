// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Env } from '../src/env';
import { USERNAME_CLAIM } from '../src/exchange';
import { ADMIN_ORG_TIER } from '../src/flags';
import { handle, type Deps } from '../src/index';
import type { MemberOrgTier } from '../src/tiers';

const ISSUER = 'https://auth.test/';
const AUDIENCE = 'https://insights-api.test/';
const MCP_CLIENT = 'mcp-client';

const env: Env = {
  ORIGIN_URL: 'http://origin.test',
  PAT_HASH_SALT: 'salt',
  LFX_API_URL: 'https://lfx-api.test/',
  M2M_ISSUER_URL: ISSUER,
  M2M_AUDIENCE: 'https://lfx-api.test/',
  M2M_CLIENT_ID: 'client',
  M2M_PRIVATE_KEY: 'unused',
  INSIGHTS_API_AUDIENCE: AUDIENCE,
  LD_SDK_KEY: 'sdk-test',
  LD_FLAG_URL: 'https://flags.test/admin-flag',
  JWT_CLIENT_IDS: MCP_CLIENT,
};

const rsa = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};
const auth0Key = (await crypto.subtle.generateKey(rsa, true, ['sign', 'verify'])) as CryptoKeyPair;
const otherKey = (await crypto.subtle.generateKey(rsa, true, ['sign', 'verify'])) as CryptoKeyPair;
const publicJwk = {
  ...(await crypto.subtle.exportKey('jwk', auth0Key.publicKey)),
  kid: 'key-1',
  alg: 'RS256',
  use: 'sig',
};

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = () => Math.floor(Date.now() / 1000);

function claims(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    iss: ISSUER,
    aud: AUDIENCE,
    sub: 'auth0|test-user',
    client_id: MCP_CLIENT,
    iat: now(),
    exp: now() + 3600,
    jti: crypto.randomUUID(),
    [USERNAME_CLAIM]: 'test-user',
    ...overrides,
  };
}

async function signJwt(
  payload: Record<string, unknown> = claims(),
  { key = auth0Key.privateKey, kid = 'key-1' }: { key?: CryptoKey; kid?: string } = {},
): Promise<string> {
  const input = `${encode({ alg: 'RS256', typ: 'JWT', kid })}.${encode(payload)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(input),
  );
  return `${input}.${Buffer.from(signature).toString('base64url')}`;
}

async function signHs256(payload: Record<string, unknown>): Promise<string> {
  const secret = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('shared-secret'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const input = `${encode({ alg: 'HS256', typ: 'JWT', kid: 'key-1' })}.${encode(payload)}`;
  const signature = await crypto.subtle.sign('HMAC', secret, new TextEncoder().encode(input));
  return `${input}.${Buffer.from(signature).toString('base64url')}`;
}

// Serves Auth0's key set at the issuer; any other URL, the down issuer included, fails.
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.endsWith('/.well-known/jwks.json') && !url.startsWith('https://auth-down.test/')) {
      return Response.json({ keys: [publicJwk] });
    }
    return new Response('unavailable', { status: 503 });
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const goldTier: MemberOrgTier = {
  b2b_org_uid: '001B000000IqhSLIAZ',
  membership_uid: '02i2M000009ABCdIAM',
  tier: 'gold',
};

function memoryCache() {
  const entries = new Map<string, unknown>();
  const ttls = new Map<string, number>();
  const cache: Deps['cache'] = {
    get: async (key) => entries.get(key) as Awaited<ReturnType<Deps['cache']['get']>>,
    put: async (key, value, ttl) => {
      entries.set(key, value);
      ttls.set(key, ttl);
    },
  };
  return { ...cache, entries, ttls };
}

function setup({
  memberTiers = async () => [goldTier],
  admins = [],
}: { memberTiers?: Deps['fetchMemberTiers']; admins?: string[] } = {}) {
  const deps = {
    cache: memoryCache(),
    exchangePat: vi.fn(async () => null),
    fetchAdminUsernames: vi.fn(async () => admins),
    fetchMemberTiers: vi.fn(memberTiers),
    callOrigin: vi.fn(async (_request: Request) => new Response('ok')),
  };
  const forwarded = () => {
    expect(deps.callOrigin).toHaveBeenCalledOnce();
    return deps.callOrigin.mock.calls[0]![0];
  };
  return { deps, forwarded };
}

function apiRequest(token: string, headers: Record<string, string> = {}) {
  return new Request('https://api.insights.linuxfoundation.org/v1-alpha/projects/k8s?x=1', {
    headers: { authorization: `Bearer ${token}`, ...headers },
  });
}

function expectNothingLookedUp(deps: ReturnType<typeof setup>['deps']) {
  expect(deps.exchangePat).not.toHaveBeenCalled();
  expect(deps.fetchAdminUsernames).not.toHaveBeenCalled();
  expect(deps.fetchMemberTiers).not.toHaveBeenCalled();
  expect(deps.callOrigin).not.toHaveBeenCalled();
  expect(deps.cache.entries.size).toBe(0);
}

async function expectUnauthorized(response: Response) {
  expect(response.status).toBe(401);
  expect(response.headers.get('www-authenticate')).toBe('Bearer');
  expect(await response.json()).toMatchObject({ statusCode: 401, code: 'unauthorized' });
}

describe('api gateway JWT path', () => {
  it('names both credentials in the 401 message', async () => {
    const { deps } = setup();
    const response = await handle(new Request('https://api.test/v1-alpha/x'), env, deps);

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      message: 'A valid personal access token or LFX access token is required',
    });
  });

  it.each([
    ['unset', undefined],
    ['empty', ''],
  ])('rejects a valid JWT while the allow-list is %s, before fetching any key', async (_, ids) => {
    const { deps } = setup();
    const response = await handle(
      apiRequest(await signJwt()),
      { ...env, JWT_CLIENT_IDS: ids },
      deps,
    );

    await expectUnauthorized(response);
    expect(fetchMock).not.toHaveBeenCalled();
    expectNothingLookedUp(deps);
  });

  it('forwards a valid token from an allow-listed client with its own JWT and tier', async () => {
    const { deps, forwarded } = setup();
    const token = await signJwt();
    const response = await handle(
      apiRequest(token, { 'cf-connecting-ip': '203.0.113.7' }),
      env,
      deps,
    );

    expect(response.status).toBe(200);
    expect(deps.exchangePat).not.toHaveBeenCalled();
    expect(deps.fetchMemberTiers).toHaveBeenCalledWith('test-user', env);
    const request = forwarded();
    expect(request.url).toBe('http://origin.test/v1-alpha/projects/k8s?x=1');
    expect(request.headers.get('authorization')).toBe(`Bearer ${token}`);
    expect(request.headers.get('x-org-id')).toBe('001B000000IqhSLIAZ');
    expect(request.headers.get('x-tier')).toBe('gold');
    expect(request.headers.get('x-client-ip')).toBe('203.0.113.7');
  });

  it("reads the key set from the issuer's JWKS endpoint", async () => {
    const issuer = 'https://auth-fresh.test/';
    const { deps } = setup();
    const response = await handle(
      apiRequest(await signJwt(claims({ iss: issuer }))),
      { ...env, M2M_ISSUER_URL: issuer },
      deps,
    );

    expect(response.status).toBe(200);
    const urls = fetchMock.mock.calls.map(([input]) =>
      input instanceof Request ? input.url : String(input),
    );
    expect(urls).toContain('https://auth-fresh.test/.well-known/jwks.json');
  });

  it('accepts any client in a comma-separated allow-list', async () => {
    const { deps } = setup();
    const response = await handle(
      apiRequest(await signJwt()),
      { ...env, JWT_CLIENT_IDS: `other-client, ${MCP_CLIENT}` },
      deps,
    );

    expect(response.status).toBe(200);
  });

  it('reads the client from azp when the token has no client_id', async () => {
    const { deps } = setup();
    const token = await signJwt(claims({ client_id: undefined, azp: MCP_CLIENT }));
    const response = await handle(apiRequest(token), env, deps);

    expect(response.status).toBe(200);
  });

  it('prefers client_id over azp', async () => {
    const { deps } = setup();
    const token = await signJwt(claims({ client_id: 'other-client', azp: MCP_CLIENT }));
    const response = await handle(apiRequest(token), env, deps);

    await expectUnauthorized(response);
    expectNothingLookedUp(deps);
  });

  it.each<[string, () => Promise<string>]>([
    ['a bad signature', () => signJwt(claims(), { key: otherKey.privateKey })],
    ['an unknown key id', () => signJwt(claims(), { kid: 'key-2' })],
    ['a wrong audience', () => signJwt(claims({ aud: 'https://other-api.test/' }))],
    ['a wrong issuer', () => signJwt(claims({ iss: 'https://evil.test/' }))],
    ['an expired token', () => signJwt(claims({ iat: now() - 7200, exp: now() - 3600 }))],
    ['a token without expiry', () => signJwt(claims({ exp: undefined }))],
    ['an HS256 token', () => signHs256(claims())],
    ['a malformed token', async () => 'not-a-jwt'],
    ['a client off the allow-list', () => signJwt(claims({ client_id: 'other-client' }))],
    ['a token without a client claim', () => signJwt(claims({ client_id: undefined }))],
    ['a token without the username claim', () => signJwt(claims({ [USERNAME_CLAIM]: undefined }))],
    ['an empty username claim', () => signJwt(claims({ [USERNAME_CLAIM]: '' }))],
  ])('rejects %s without looking anything up', async (_, token) => {
    const { deps } = setup();
    const response = await handle(apiRequest(await token()), env, deps);

    await expectUnauthorized(response);
    expectNothingLookedUp(deps);
  });

  it('gives an admin-flagged LFID the admin org and tier without calling member-tiers', async () => {
    const { deps, forwarded } = setup({ admins: ['test-user'] });
    await handle(apiRequest(await signJwt()), env, deps);

    const headers = forwarded().headers;
    expect(deps.fetchMemberTiers).not.toHaveBeenCalled();
    expect(headers.get('x-org-id')).toBe(ADMIN_ORG_TIER.orgId);
    expect(headers.get('x-tier')).toBe(ADMIN_ORG_TIER.tier);
  });

  it('forwards a caller without an active membership without org and tier headers', async () => {
    const { deps, forwarded } = setup({ memberTiers: async () => [] });
    const response = await handle(
      apiRequest(await signJwt(), { 'x-tier': 'platinum', 'x-org-id': 'someone-else' }),
      env,
      deps,
    );

    expect(response.status).toBe(200);
    expect(forwarded().headers.get('x-tier')).toBeNull();
    expect(forwarded().headers.get('x-org-id')).toBeNull();
  });

  it('overwrites client-supplied trusted headers', async () => {
    const { deps, forwarded } = setup();
    await handle(
      apiRequest(await signJwt(), {
        'x-tier': 'platinum',
        'x-org-id': 'someone-else',
        'x-client-ip': '198.51.100.1',
      }),
      env,
      deps,
    );

    const headers = forwarded().headers;
    expect(headers.get('x-tier')).toBe('gold');
    expect(headers.get('x-org-id')).toBe('001B000000IqhSLIAZ');
    expect(headers.get('x-client-ip')).toBeNull();
  });

  it('caches the tier per username for 10 minutes under a salted hash', async () => {
    const { deps } = setup();
    await handle(apiRequest(await signJwt()), env, deps);
    await handle(apiRequest(await signJwt()), env, deps);

    expect(deps.fetchAdminUsernames).toHaveBeenCalledTimes(1);
    expect(deps.fetchMemberTiers).toHaveBeenCalledTimes(1);
    expect(deps.callOrigin).toHaveBeenCalledTimes(2);
    expect(deps.cache.entries.size).toBe(1);
    const [key] = deps.cache.entries.keys();
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(deps.cache.ttls.get(key!)).toBe(600);
  });

  it('forwards each caller with their own token when the tier comes from the cache', async () => {
    const { deps } = setup();
    const first = await signJwt();
    const second = await signJwt();
    await handle(apiRequest(first), env, deps);
    await handle(apiRequest(second), env, deps);

    const sent = deps.callOrigin.mock.calls.map(([request]) =>
      request.headers.get('authorization'),
    );
    expect(sent).toEqual([`Bearer ${first}`, `Bearer ${second}`]);
  });

  it('verifies every token even when the username tier is cached', async () => {
    const { deps } = setup();
    await handle(apiRequest(await signJwt()), env, deps);
    const response = await handle(
      apiRequest(await signJwt(claims({ iat: now() - 7200, exp: now() - 3600 }))),
      env,
      deps,
    );

    await expectUnauthorized(response);
    expect(deps.callOrigin).toHaveBeenCalledTimes(1);
  });

  it.each<[string, () => void]>([
    ['answers 503', () => {}],
    ['cannot be reached', () => fetchMock.mockRejectedValue(new TypeError('fetch failed'))],
  ])('fails as a server error, not 401, when the key set %s', async (_, breakFetch) => {
    breakFetch();
    const issuer = 'https://auth-down.test/';
    const { deps } = setup();
    const status = await handle(
      apiRequest(await signJwt(claims({ iss: issuer }))),
      { ...env, M2M_ISSUER_URL: issuer },
      deps,
    ).then(
      (response) => response.status,
      () => 500,
    );

    expect(status).toBeGreaterThanOrEqual(500);
    expect(deps.fetchMemberTiers).not.toHaveBeenCalled();
    expect(deps.callOrigin).not.toHaveBeenCalled();
  });
});
