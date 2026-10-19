// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockSendRedirect = vi.fn();
const mockGetQuery = vi.fn();
const mockGetCookie = vi.fn();

global.defineEventHandler = vi.fn((handler) => handler);
global.useRuntimeConfig = vi.fn(() => ({ public: {} })) as never;
global.getQuery = mockGetQuery;
global.getCookie = mockGetCookie;
global.getHeader = vi.fn();
global.deleteCookie = vi.fn();
global.sendRedirect = mockSendRedirect;
global.createError = vi.fn((error) => error);

let handler: (event: H3Event) => Promise<unknown>;

beforeAll(async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  handler = (await import('./callback')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCookie.mockImplementation((_event, name: string) =>
    name === 'auth_redirect_to' ? '/project/linux?auth=success' : undefined,
  );
});

describe('GET /api/auth/callback silent authentication errors', () => {
  it.each([
    'login_required',
    'interaction_required',
    'consent_required',
    'account_selection_required',
    'access_denied',
  ])('redirects %s back to the original page', async (error) => {
    mockGetQuery.mockReturnValue({ error });

    await handler({ context: {} } as H3Event);

    expect(mockSendRedirect).toHaveBeenCalledWith({ context: {} }, '/project/linux');
  });

  it('still fails other Auth0 errors with a 400', async () => {
    mockGetQuery.mockReturnValue({ error: 'server_error', error_description: 'boom' });

    await expect(handler({ context: {} } as H3Event)).rejects.toMatchObject({ statusCode: 400 });
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });
});
