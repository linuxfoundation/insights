// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockFetchFromTinybird = vi.fn();
const mockCreateError = vi.fn((error) => error);

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

vi.mock('~~/server/utils/plausible', () => ({
  useApiTrackEvent: vi.fn(),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = mockCreateError;

let handler: (event: H3Event) => Promise<unknown>;

beforeAll(async () => {
  const module = await import('./insights.get');
  handler = module.default;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function createEvent(slug: string) {
  return { context: { params: { slug } } } as unknown as H3Event;
}

function mockTinybirdRow(slug: string) {
  mockFetchFromTinybird.mockResolvedValue({
    data: [
      {
        slug,
        healthScoreV2: 42,
        healthLabel: 'Fair',
        isLF: true,
        achievements: [],
      },
    ],
  });
}

describe('IN-1244: kernel health score should be unavailable in project insights', () => {
  it('nulls out healthScoreV2/healthLabel/healthScore for korg', async () => {
    mockTinybirdRow('korg');

    const result = (await handler(createEvent('korg'))) as {
      healthScoreV2: number | null;
      healthLabel: string | null;
      healthScore: number | null;
    };

    // fails before fix: unfixed code returns the raw Tinybird values (42/'Fair') for Kernel
    expect(result.healthScoreV2).toBeNull();
    expect(result.healthLabel).toBeNull();
    expect(result.healthScore).toBeNull();
  });

  it('leaves healthScoreV2/healthLabel/healthScore untouched for a non-kernel project', async () => {
    mockTinybirdRow('some-other-project');

    const result = (await handler(createEvent('some-other-project'))) as {
      healthScoreV2: number | null;
      healthLabel: string | null;
      healthScore: number | null;
    };

    expect(result.healthScoreV2).toBe(42);
    expect(result.healthLabel).toBe('Fair');
    expect(result.healthScore).toBe(42);
  });
});
