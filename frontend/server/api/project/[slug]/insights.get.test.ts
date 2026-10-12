// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockFetchFromTinybird = vi.fn();

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));
vi.mock('~~/server/utils/plausible', () => ({ useApiTrackEvent: vi.fn() }));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);

let handler: (event: H3Event) => Promise<Record<string, unknown>>;

beforeAll(async () => {
  handler = (await import('./insights.get')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const event = { context: { params: { slug: 'k8s' } } } as unknown as H3Event;

describe('GET /api/project/[slug]/insights', () => {
  it('serves the v2 score as healthScore and omits the v1 sub-scores', async () => {
    mockFetchFromTinybird.mockResolvedValue({
      data: [
        {
          slug: 'k8s',
          isLF: 1,
          healthScore: 87.5,
          contributorHealthScore: 90,
          popularityHealthScore: 95,
          developmentHealthScore: 80,
          securityHealthScore: 85,
          healthScoreV2: 71,
          healthLabel: 'healthy',
          achievements: [],
        },
      ],
    });

    const res = await handler(event);

    expect(res).toMatchObject({ slug: 'k8s', healthScore: 71, healthLabel: 'healthy', isLF: true });
    expect(res).not.toHaveProperty('contributorHealthScore');
    expect(res).not.toHaveProperty('popularityHealthScore');
    expect(res).not.toHaveProperty('developmentHealthScore');
    expect(res).not.toHaveProperty('securityHealthScore');
  });

  it('returns a null healthScore for a project without a v2 score', async () => {
    mockFetchFromTinybird.mockResolvedValue({
      data: [{ slug: 'korg', isLF: 0, healthScoreV2: null, healthLabel: null, achievements: [] }],
    });

    const res = await handler(event);

    expect(res).toMatchObject({ healthScore: null, healthLabel: null });
  });
});
