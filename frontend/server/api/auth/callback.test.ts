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
const mockGetHeader = vi.fn();
global.getHeader = mockGetHeader;
global.getRequestURL = vi.fn(() => new URL('https://insights.example/cb?code=c&state=s'));
global.setCookie = vi.fn();
global.deleteCookie = vi.fn();
global.setResponseHeaders = vi.fn();
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
  mockGetHeader.mockReset();
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
    expect(signed).toContainEqual({
      typ: 'insights-refresh',
      rt: 'rt-1',
      sub: 'auth0|user',
      sid: 'sid-1',
      auth_time: 1000,
    });
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

describe('GET /api/auth/callback background frame check', () => {
  const framePkce = JSON.stringify({ state: 's', codeVerifier: 'v', silent: true, frame: true });

  // Runs the page script against a fake parent to capture exactly what it posts, and where
  const postedBy = (body: unknown) => {
    const html = String(body);
    const open = '<script>';
    const start = html.indexOf(open);
    expect(start).toBeGreaterThan(-1);
    const script = html.slice(start + open.length, html.indexOf('</script>', start));
    const postMessage = vi.fn();
    new Function('window', script)({
      parent: { postMessage },
      location: { origin: 'https://insights.example' },
    });
    return postMessage.mock.calls;
  };

  const expectFrameAnswer = (body: unknown, result: 'success' | 'none') => {
    expect(postedBy(body)).toEqual([
      [{ type: 'insights-sso', result }, 'https://insights.example'],
    ]);
    expect(globalThis.setResponseHeaders).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        'cache-control': 'no-store',
        'content-type': 'text/html; charset=utf-8',
      }),
    );
    expect(mockSendRedirect).not.toHaveBeenCalled();
  };

  it('sets the session and posts success to its own origin', async () => {
    const { authorizationCodeGrant } = await import('openid-client');
    vi.mocked(authorizationCodeGrant).mockResolvedValueOnce({
      id_token: 'id-token',
      refresh_token: 'refresh-token',
      access_token: 'access-token',
      expires_in: 60,
    } as never);
    cookies.auth_pkce = framePkce;
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    const body = await handler({ context: {} } as H3Event);

    expectFrameAnswer(body, 'success');
    expect(globalThis.setCookie).toHaveBeenCalledWith(
      expect.anything(),
      'insights_oidc_token',
      'signed',
      expect.anything(),
    );
    for (const secret of ['signed', 'id-token', 'refresh-token', 'access-token', 'c']) {
      expect(String(body)).not.toContain(`"${secret}"`);
    }
    expect(String(body)).not.toMatch(/token/i);
  });

  it.each(['login_required', 'consent_required', 'server_error'])(
    'posts none for %s and keeps the silent guard',
    async (error) => {
      cookies.auth_pkce = framePkce;
      mockGetQuery.mockReturnValue({ error, error_description: 'x' });

      const body = await handler({ context: {} } as H3Event);

      expectFrameAnswer(body, 'none');
      expect(globalThis.deleteCookie).not.toHaveBeenCalledWith(expect.anything(), 'auth_pkce');
    },
  );

  it('posts none instead of restarting login when another tab replaced auth_pkce', async () => {
    cookies.auth_pkce = JSON.stringify({ state: 'other', codeVerifier: 'v', silent: false });
    mockGetHeader.mockImplementation((_event, name: string) =>
      name === 'sec-fetch-dest' ? 'iframe' : undefined,
    );
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    const body = await handler({ context: {} } as H3Event);

    expectFrameAnswer(body, 'none');
    expect(globalThis.deleteCookie).not.toHaveBeenCalled();
  });

  const fetchDest = (value: string) =>
    mockGetHeader.mockImplementation((_event, name: string) =>
      name === 'sec-fetch-dest' ? value : undefined,
    );

  it('restarts login for a top-level callback whose auth_pkce a frame check overwrote', async () => {
    cookies.auth_pkce = JSON.stringify({ ...JSON.parse(framePkce), state: 'other' });
    fetchDest('document');
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    const body = await handler({ context: {} } as H3Event);

    expect(body).toBeUndefined();
    expect(mockSendRedirect).toHaveBeenCalledWith({ context: {} }, '/api/auth/login');
    expect(globalThis.setResponseHeaders).not.toHaveBeenCalled();
  });

  it('redirects a top-level silent failure even when auth_pkce says frame', async () => {
    cookies.auth_pkce = framePkce;
    fetchDest('document');
    mockGetQuery.mockReturnValue({ error: 'login_required' });

    await handler({ context: {} } as H3Event);

    expect(mockSendRedirect).toHaveBeenCalledWith({ context: {} }, '/project/linux');
  });

  it('trusts the frame flag in auth_pkce when the browser sends no fetch metadata', async () => {
    cookies.auth_pkce = JSON.stringify({ ...JSON.parse(framePkce), state: 'other' });
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    const body = await handler({ context: {} } as H3Event);

    expectFrameAnswer(body, 'none');
  });

  it('posts none when the frame arrives without its auth_pkce cookie', async () => {
    mockGetHeader.mockImplementation((_event, name: string) =>
      name === 'sec-fetch-dest' ? 'iframe' : undefined,
    );
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    const body = await handler({ context: {} } as H3Event);

    expectFrameAnswer(body, 'none');
  });

  it.each([
    [
      'a reused code',
      'authorizationCodeGrant',
      { code: 'OAUTH_RESPONSE_BODY_ERROR', error: 'invalid_grant' },
    ],
    ['a token exchange failure', 'authorizationCodeGrant', new Error('boom')],
    ['a discovery failure', 'discovery', new Error('auth0 unreachable')],
  ] as const)('posts none and keeps every cookie for %s', async (_label, step, failure) => {
    const openid = await import('openid-client');
    vi.mocked(openid[step]).mockRejectedValueOnce(failure);
    cookies.auth_pkce = framePkce;
    mockGetQuery.mockReturnValue({ code: 'c', state: 's' });

    const body = await handler({ context: {} } as H3Event);

    expectFrameAnswer(body, 'none');
    expect(globalThis.deleteCookie).not.toHaveBeenCalled();
    expect(globalThis.setCookie).not.toHaveBeenCalled();
  });
});
