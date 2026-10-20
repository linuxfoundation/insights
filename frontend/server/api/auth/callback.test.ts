// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockSendRedirect = vi.fn();
const mockGetQuery = vi.fn();
const mockGetCookie = vi.fn();

vi.mock('openid-client', () => ({
  discovery: vi.fn(async () => ({})),
  authorizationCodeGrant: vi.fn(async () => ({ id_token: 'id-token', expires_in: 60 })),
}));
vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn(() => ({ sub: 'auth0|user' })) }));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn(() => 'signed') } }));

global.defineEventHandler = vi.fn((handler) => handler);
const { runtimeConfig } = vi.hoisted(() => ({
  runtimeConfig: {
    auth0ClientSecret: 'secret',
    lfxAuth0TokenClaimGroupKey: 'claims',
    public: { auth0Domain: 'auth0.example', auth0RedirectUri: 'https://insights.example/cb' },
  },
}));
// Overlay test values on the real config: the Nuxt test environment reads it while booting.
mockNuxtImport('useRuntimeConfig', (original) => () => {
  const config = original();
  return { ...config, ...runtimeConfig, public: { ...config.public, ...runtimeConfig.public } };
});
global.getQuery = mockGetQuery;
global.getCookie = mockGetCookie;
global.getHeader = vi.fn();
global.getRequestURL = vi.fn(() => new URL('https://insights.example/cb?code=c&state=s'));
global.setCookie = vi.fn();
global.deleteCookie = vi.fn();
global.sendRedirect = mockSendRedirect;
global.createError = vi.fn((error) => error);

let handler: (event: H3Event) => Promise<unknown>;
let cookies: Record<string, string | undefined>;

beforeAll(async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  handler = (await import('./callback')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
  cookies = { auth_redirect_to: '/project/linux?auth=success' };
  mockGetCookie.mockImplementation((_event, name: string) => cookies[name]);
});

const location = () => mockSendRedirect.mock.calls[0][1] as string;
const isSameOrigin = (url: string) =>
  new URL(url, 'https://insights.example').host === 'insights.example';

describe('GET /api/auth/callback silent authentication errors', () => {
  it.each([
    'login_required',
    'interaction_required',
    'consent_required',
    'account_selection_required',
  ])('redirects %s back to the original page', async (error) => {
    mockGetQuery.mockReturnValue({ error });

    await handler({ context: {} } as H3Event);

    expect(mockSendRedirect).toHaveBeenCalledWith({ context: {} }, '/project/linux');
  });

  it('redirects access_denied back when the attempt was silent', async () => {
    cookies.auth_pkce = JSON.stringify({ state: 's', codeVerifier: 'v', silent: true });
    mockGetQuery.mockReturnValue({ error: 'access_denied' });

    await handler({ context: {} } as H3Event);

    expect(mockSendRedirect).toHaveBeenCalledWith({ context: {} }, '/project/linux');
  });

  it('fails access_denied with a 400 when the attempt was interactive', async () => {
    cookies.auth_pkce = JSON.stringify({ state: 's', codeVerifier: 'v', silent: false });
    mockGetQuery.mockReturnValue({ error: 'access_denied', error_description: 'denied' });

    await expect(handler({ context: {} } as H3Event)).rejects.toMatchObject({ statusCode: 400 });
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });

  it('still fails other Auth0 errors with a 400', async () => {
    mockGetQuery.mockReturnValue({ error: 'server_error', error_description: 'boom' });

    await expect(handler({ context: {} } as H3Event)).rejects.toMatchObject({ statusCode: 400 });
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });
});

describe('GET /api/auth/callback redirect target', () => {
  const evilTargets = ['/.//evil.com', '/%2e//evil.com', '/./\\evil.com', '/\\evil.com'];

  it.each(evilTargets)('keeps a silent failure redirect to %s on this origin', async (target) => {
    cookies.auth_redirect_to = target;
    mockGetQuery.mockReturnValue({ error: 'login_required' });

    await handler({ context: {} } as H3Event);

    expect(isSameOrigin(location())).toBe(true);
  });

  it.each(evilTargets)('keeps a successful login redirect to %s on this origin', async (target) => {
    cookies.auth_redirect_to = target;
    cookies.auth_pkce = JSON.stringify({ state: 's', codeVerifier: 'v' });
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    await handler({ context: {} } as H3Event);

    expect(isSameOrigin(location())).toBe(true);
    expect(location()).toContain('auth=success');
  });

  it('wraps the refresh token with the session it belongs to', async () => {
    const { jwtDecode } = await import('jwt-decode');
    const { authorizationCodeGrant } = await import('openid-client');
    const jwt = (await import('jsonwebtoken')).default;
    vi.mocked(jwtDecode).mockReturnValueOnce({ sub: 'auth0|user', sid: 'sid-1', auth_time: 1000 });
    vi.mocked(authorizationCodeGrant).mockResolvedValueOnce({
      id_token: 'id-token',
      expires_in: 60,
      refresh_token: 'rt-1',
    } as never);
    cookies.auth_pkce = JSON.stringify({ state: 's', codeVerifier: 'v' });
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    await handler({ context: {} } as H3Event);

    const signed = vi.mocked(jwt.sign).mock.calls.map(([payload]) => payload);
    expect(signed).toContainEqual(expect.objectContaining({ sid: 'sid-1', auth_time: 1000 }));
    expect(signed).toContainEqual({ rt: 'rt-1', sub: 'auth0|user', sid: 'sid-1', auth_time: 1000 });
    expect(global.setCookie).toHaveBeenCalledWith(
      expect.anything(),
      'insights_refresh_token',
      'signed',
      expect.anything(),
    );
  });

  it('keeps the Auth0 session id in the minted cookie', async () => {
    const { jwtDecode } = await import('jwt-decode');
    const jwt = (await import('jsonwebtoken')).default;
    vi.mocked(jwtDecode).mockReturnValueOnce({ sub: 'auth0|user', sid: 'sid-1' });
    cookies.auth_pkce = JSON.stringify({ state: 's', codeVerifier: 'v' });
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    await handler({ context: {} } as H3Event);

    expect(vi.mocked(jwt.sign).mock.calls[0]![0]).toMatchObject({ sid: 'sid-1' });
  });

  it('appends auth=success to the original page after login', async () => {
    cookies.auth_pkce = JSON.stringify({ state: 's', codeVerifier: 'v' });
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    await handler({ context: {} } as H3Event);

    expect(location()).toBe('/project/linux?auth=success');
  });
});
