// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3';
import jwt from 'jsonwebtoken';
import { refreshTokenGrant } from 'openid-client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { verifyOrRefreshOidcToken } from './auth-refresh';
import { isSessionRevoked } from './backchannel-logout';

vi.mock('h3', async (importOriginal) => ({
  ...(await importOriginal<typeof import('h3')>()),
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));
vi.mock('openid-client', () => ({
  discovery: vi.fn(async () => ({})),
  refreshTokenGrant: vi.fn(async () => ({ id_token: 'id-token', expires_in: 60 })),
}));
vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn(() => ({ sub: 'auth0|u', sid: 'sid-1' })) }));
vi.mock('./backchannel-logout', () => ({ isSessionRevoked: vi.fn(async () => false) }));

const secret = 'test-secret';
mockNuxtImport('useRuntimeConfig', (original) => () => ({
  ...original(),
  auth0ClientSecret: 'test-secret',
  lfxAuth0TokenClaimGroupKey: 'claims',
}));

let cookies: Record<string, string | undefined>;
const event = {} as H3Event;
const now = () => Math.floor(Date.now() / 1000);
const mint = (claims: object) =>
  jwt.sign({ sub: 'auth0|u', sid: 'sid-1', iat: now(), exp: now() + 60, ...claims }, secret);

beforeEach(() => {
  vi.clearAllMocks();
  cookies = {};
  vi.mocked(getCookie).mockImplementation((_event, name) => cookies[name]);
});

const expectAuthCookiesCleared = () => {
  const cleared = vi.mocked(deleteCookie).mock.calls.map(([, name]) => name);
  expect(cleared).toEqual(
    expect.arrayContaining(['insights_oidc_token', 'insights_refresh_token']),
  );
};

describe('verifyOrRefreshOidcToken back-channel revocation', () => {
  it('returns a valid, unrevoked session', async () => {
    cookies.insights_oidc_token = mint({});

    expect(await verifyOrRefreshOidcToken(event)).toMatchObject({ sid: 'sid-1' });
  });

  it('rejects a revoked session without refreshing it', async () => {
    cookies.insights_oidc_token = mint({});
    cookies.insights_refresh_token = 'refresh';
    vi.mocked(isSessionRevoked).mockResolvedValueOnce(true);

    expect(await verifyOrRefreshOidcToken(event)).toBeNull();
    expect(refreshTokenGrant).not.toHaveBeenCalled();
    expectAuthCookiesCleared();
  });

  it('carries the Auth0 sid into the re-minted cookie', async () => {
    cookies.insights_refresh_token = 'refresh-a';

    const decoded = await verifyOrRefreshOidcToken(event);

    expect(decoded).toMatchObject({ sid: 'sid-1' });
    const minted = vi.mocked(setCookie).mock.calls.find(([, n]) => n === 'insights_oidc_token');
    expect(jwt.verify(minted![2], secret)).toMatchObject({ sid: 'sid-1' });
  });

  it('rejects a refreshed session that was revoked', async () => {
    cookies.insights_refresh_token = 'refresh-b';
    vi.mocked(isSessionRevoked).mockResolvedValueOnce(true);

    expect(await verifyOrRefreshOidcToken(event)).toBeNull();
    expect(refreshTokenGrant).toHaveBeenCalledTimes(1);
    expect(vi.mocked(setCookie).mock.calls.map(([, n]) => n)).not.toContain('insights_oidc_token');
    expectAuthCookiesCleared();
  });
});
