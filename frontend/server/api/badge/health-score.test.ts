// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockSendRedirect = vi.fn();
const mockFetchFromTinybird = vi.fn();

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

vi.mock('~~/server/utils/log', () => ({ logError: vi.fn() }));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);
global.getQuery = vi.fn(() => ({ project: 'test' }));
global.sendRedirect = mockSendRedirect;

let handler: (event: H3Event) => Promise<void>;

beforeAll(async () => {
  handler = (await import('./health-score')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const redirectMessage = () =>
  new URL(mockSendRedirect.mock.calls[0]?.[1] as string).searchParams.get('message');

describe('GET /api/badge/health-score', () => {
  it('keeps the plain band label for a full score', async () => {
    mockFetchFromTinybird.mockResolvedValue({
      data: [{ healthLabel: 'excellent', healthScoreV2: 88, healthMaxScore: 100 }],
    });
    await handler({} as H3Event);
    expect(redirectMessage()).toBe('Excellent');
  });

  it('appends an asterisk and score/max for a partial score', async () => {
    mockFetchFromTinybird.mockResolvedValue({
      data: [{ healthLabel: 'excellent', healthScoreV2: 64, healthMaxScore: 75 }],
    });
    await handler({} as H3Event);
    expect(redirectMessage()).toBe('Excellent* (64/75)');
  });

  it('throws 404 when the project has no rows', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [] });
    await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 404 });
  });
});
