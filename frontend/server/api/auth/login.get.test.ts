// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockDiscovery = vi.fn();
const mockSendRedirect = vi.fn();
const mockGetQuery = vi.fn();
const mockGetHeader = vi.fn();

vi.mock('openid-client', () => ({
  discovery: (...args: unknown[]) => mockDiscovery(...args),
  randomState: vi.fn(),
  randomPKCECodeVerifier: vi.fn(),
  calculatePKCECodeChallenge: vi.fn(),
  buildAuthorizationUrl: vi.fn(),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.useRuntimeConfig = vi.fn(() => ({ public: { auth0Domain: 'auth0.example' } })) as never;
global.getQuery = mockGetQuery;
global.getHeader = mockGetHeader;
global.sendRedirect = mockSendRedirect;
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

describe('GET /api/auth/login error handling (OPS-839)', () => {
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

  it('still throws a 500 for a failed non-silent request', async () => {
    mockGetQuery.mockReturnValue({ redirectTo: '/project/linux' });
    mockGetHeader.mockImplementation((_event, name: string) => browserHeaders(name));

    await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 500 });
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });
});
