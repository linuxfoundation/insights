// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockGetHeader = vi.fn();

vi.mock('h3', async (importOriginal) => ({
  ...(await importOriginal<typeof import('h3')>()),
  getCookie: vi.fn(() => undefined),
}));

vi.mock('~~/server/utils/auth-refresh', () => ({
  verifyOrRefreshOidcToken: vi.fn(async () => null),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.getHeader = mockGetHeader;

let handler: (event: H3Event) => Promise<{ shouldAttemptSilentLogin?: boolean }>;

beforeAll(async () => {
  handler = (await import('./user.get')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const withUserAgent = (userAgent: string) =>
  mockGetHeader.mockImplementation((_event, name: string) =>
    name === 'user-agent' ? userAgent : undefined,
  );

describe('GET /api/auth/user silent login suggestion', () => {
  it('suggests silent login to a normal Chrome browser', async () => {
    withUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    );

    expect((await handler({} as H3Event)).shouldAttemptSilentLogin).toBe(true);
  });

  it('does not suggest silent login to Googlebot', async () => {
    withUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');

    expect((await handler({} as H3Event)).shouldAttemptSilentLogin).toBe(false);
  });

  it('does not suggest silent login to HeadlessChrome', async () => {
    withUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/129.0.0.0 Safari/537.36',
    );

    expect((await handler({} as H3Event)).shouldAttemptSilentLogin).toBe(false);
  });

  it.each([
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0;)',
    'Mozilla/5.0 (compatible; GoogleOther)',
  ])('does not suggest silent login to Google tool agent %s', async (userAgent) => {
    withUserAgent(userAgent);

    expect((await handler({} as H3Event)).shouldAttemptSilentLogin).toBe(false);
  });
});
