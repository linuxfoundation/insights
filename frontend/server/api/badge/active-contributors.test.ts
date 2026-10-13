// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import type { DateTime } from 'luxon';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

const mockSendRedirect = vi.fn();
const mockFetchFromTinybird = vi.fn();

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

vi.mock('~~/server/utils/log', () => ({ logError: vi.fn() }));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);
global.getQuery = vi.fn(() => ({ project: 'envoy' }));
global.sendRedirect = mockSendRedirect;

let handler: (event: H3Event) => Promise<void>;

beforeAll(async () => {
  handler = (await import('./active-contributors')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-13T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

const redirectParam = (name: string) =>
  new URL(mockSendRedirect.mock.calls[0]?.[1] as string).searchParams.get(name);

describe('GET /api/badge/active-contributors', () => {
  it('counts active contributors over the last 365 days, like the share preview', async () => {
    mockFetchFromTinybird.mockResolvedValue({
      data: [{ contributorCount: 1580, maintainerCount: 10, reviewerCount: 20 }],
    });

    await handler({} as H3Event);

    const [path, params] = mockFetchFromTinybird.mock.calls[0] as [
      string,
      { startDate: DateTime; endDate: DateTime } & Record<string, unknown>,
    ];
    expect(path).toBe('/v0/pipes/active_contributors.json');
    expect(params).toMatchObject({
      project: 'envoy',
      includeCodeContributions: true,
      includeCollaborations: false,
    });
    expect(params.startDate.toFormat('yyyy-MM-dd')).toBe('2025-10-13');
    expect(params.endDate.toFormat('yyyy-MM-dd')).toBe('2026-10-13');
    expect(redirectParam('label')).toBe('Active contributors (1Y)');
    expect(redirectParam('message')).toBe('1.6K');
  });

  it('returns 404 when the pipe has no row for the project', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [] });

    await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 404 });
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });
});
