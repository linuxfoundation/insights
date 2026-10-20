// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockDiscovery = vi.fn();
const mockSendRedirect = vi.fn();
const mockGetQuery = vi.fn();
const mockGetHeader = vi.fn();
const mockSetCookie = vi.fn();
const mockSetResponseHeaders = vi.fn();

vi.mock('openid-client', () => ({
  discovery: (...args: unknown[]) => mockDiscovery(...args),
  randomState: vi.fn(),
  randomPKCECodeVerifier: vi.fn(),
  calculatePKCECodeChallenge: vi.fn(),
  buildAuthorizationUrl: vi.fn(() => new URL('https://auth0.example/authorize')),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.useRuntimeConfig = vi.fn(() => ({ public: { auth0Domain: 'auth0.example' } })) as never;
global.getQuery = mockGetQuery;
global.getHeader = mockGetHeader;
global.sendRedirect = mockSendRedirect;
global.setCookie = mockSetCookie;
global.setResponseHeaders = mockSetResponseHeaders;
global.createError = vi.fn((error) => error);

let handler: (event: H3Event) => Promise<unknown>;

beforeAll(async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  handler = (await import('./login.get')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
  mockDiscovery.mockRejectedValue(new Error('auth0 unreachable'));
});

const browserHeaders = (name: string) =>
  ({ 'user-agent': 'Mozilla/5.0', accept: 'text/html,application/xhtml+xml' })[name];

describe('GET /api/auth/login error handling', () => {
  it('redirects a failed silent browser request back to its redirectTo path', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true', redirectTo: '/project/linux' });
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));

    await handler({} as H3Event);

    expect(mockSendRedirect).toHaveBeenCalledWith({}, '/project/linux');
  });

  it('redirects a failed silent browser request with an unsafe redirectTo to the root', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true', redirectTo: '//evil.com' });
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));

    await handler({} as H3Event);

    expect(mockSendRedirect).toHaveBeenCalledWith({}, '/');
  });

  it.each(['/\\evil.com', '/%5Cevil.com', '/.//evil.com', '/%2e//evil.com', '/./\\evil.com'])(
    'keeps a failed silent redirect to %s on this origin',
    async (redirectTo) => {
      mockGetQuery.mockReturnValue({ silent: 'true', redirectTo });
      mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));

      await handler({} as H3Event);

      const location = mockSendRedirect.mock.calls[0][1] as string;
      expect(new URL(location, 'https://insights.example').host).toBe('insights.example');
    },
  );

  it('leaves a silent auth_pkce guard when a silent browser request fails', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true', redirectTo: '/project/linux' });
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));

    await handler({} as H3Event);

    const [, name, value, options] = mockSetCookie.mock.calls[0];
    expect(name).toBe('auth_pkce');
    expect(JSON.parse(value)).toEqual({ silent: true });
    expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 120 });
    expect(mockSendRedirect).toHaveBeenCalledWith({}, '/project/linux');
  });

  it('answers a failed background frame check with a frame message instead of a redirect', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true', mode: 'frame' });
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));

    const body = await handler({} as H3Event);

    expect(body).toContain('"result":"none"');
    expect(mockSendRedirect).not.toHaveBeenCalled();
    expect(mockSetResponseHeaders).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ 'cache-control': 'no-store' }),
    );
    expect(mockSetCookie.mock.calls[0][1]).toBe('auth_pkce');
  });

  it('still throws a 500 for a failed non-silent request', async () => {
    mockGetQuery.mockReturnValue({ redirectTo: '/project/linux' });
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));

    await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 500 });
    expect(mockSendRedirect).not.toHaveBeenCalled();
    expect(mockSetCookie).not.toHaveBeenCalled();
  });
});

describe('GET /api/auth/login cookie lifetime', () => {
  const maxAgeOf = (name: string) =>
    mockSetCookie.mock.calls.find(([, cookieName]) => cookieName === name)?.[3].maxAge;

  beforeEach(() => {
    mockDiscovery.mockResolvedValue({});
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));
  });

  it('gives silent attempts a 2 minute window', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true', redirectTo: '/project/linux' });

    await handler({} as H3Event);

    expect(maxAgeOf('auth_pkce')).toBe(120);
    expect(maxAgeOf('auth_redirect_to')).toBe(120);
  });

  it('keeps 15 minutes for interactive login', async () => {
    mockGetQuery.mockReturnValue({ redirectTo: '/project/linux' });

    await handler({} as H3Event);

    expect(maxAgeOf('auth_pkce')).toBe(900);
    expect(maxAgeOf('auth_redirect_to')).toBe(900);
  });
});

describe('GET /api/auth/login cookie contents', () => {
  const pkceOf = () =>
    JSON.parse(mockSetCookie.mock.calls.find(([, name]) => name === 'auth_pkce')?.[2]);

  beforeEach(() => {
    mockDiscovery.mockResolvedValue({});
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));
  });

  it('marks a silent attempt in the auth_pkce cookie', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true' });

    await handler({} as H3Event);

    expect(pkceOf().silent).toBe(true);
  });

  it('leaves an interactive attempt unmarked', async () => {
    mockGetQuery.mockReturnValue({});

    await handler({} as H3Event);

    expect(pkceOf().silent).toBe(false);
  });

  it('marks a background frame check with a short-lived cookie', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true', mode: 'frame' });

    await handler({} as H3Event);

    expect(pkceOf()).toMatchObject({ silent: true, frame: true });
    expect(mockSetCookie.mock.calls[0][3].maxAge).toBe(120);
    expect(mockSendRedirect).toHaveBeenCalledWith({}, 'https://auth0.example/authorize');
  });

  it.each([{ silent: 'true' }, { mode: 'frame' }])(
    'leaves the frame flag off for %o',
    async (query) => {
      mockGetQuery.mockReturnValue(query);

      await handler({} as H3Event);

      expect(pkceOf().frame).toBeUndefined();
    },
  );

  it('stores a dot-segment redirectTo as a same-origin path', async () => {
    mockGetQuery.mockReturnValue({ silent: 'true', redirectTo: '/.//evil.com' });

    await handler({} as H3Event);

    const stored = mockSetCookie.mock.calls.find(([, name]) => name === 'auth_redirect_to')?.[2];
    expect(stored).toBe('/');
  });
});
