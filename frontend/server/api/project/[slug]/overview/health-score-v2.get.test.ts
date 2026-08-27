// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockFetchFromTinybird = vi.fn();
const mockCreateError = vi.fn((error) => error);

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = mockCreateError;

let handler: (event: H3Event) => Promise<unknown>;

beforeAll(async () => {
  const module = await import('./health-score-v2.get');
  handler = module.default;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function createEvent(slug: string) {
  return { context: { params: { slug } } } as unknown as H3Event;
}

describe('IN-1244: kernel health score should be unavailable', () => {
  it('returns a non-null healthScoreV2 for the-linux-kernel-organization even though sub-category signal is missing (BUG)', async () => {
    // This mirrors the actual Tinybird `project_insights` response for Kernel:
    // partial GitHub signal is enough for the pipe to compute a non-null total,
    // while the underlying sub-category scores are null/unreliable.
    mockFetchFromTinybird.mockResolvedValue({
      data: [
        {
          healthScoreV2: 42,
          healthLabel: 'Fair',
          lifecycleLabel: 'Mature',
          impactScore: 10,
          impactLabel: 'Good',
          maintainerHealthScoreV2: null,
          securitySupplyChainScoreV2: null,
          developmentActivityScoreV2: 42,
        },
      ],
    });

    const event = createEvent('the-linux-kernel-organization');
    const result = (await handler(event)) as { healthScoreV2: number | null };

    // Bug: this currently returns 42 (a computed number) instead of the
    // "Unavailable" treatment, which the UI only triggers on healthScoreV2 === null.
    expect(result.healthScoreV2).toBeNull();
  });
});
