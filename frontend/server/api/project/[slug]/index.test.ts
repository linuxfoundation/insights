// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockFetchFromTinybird = vi.fn();

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);

let handler: (event: H3Event) => Promise<Record<string, unknown>>;

beforeAll(async () => {
  handler = (await import('./index')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const event = { context: { params: { slug: 'k8s' } } } as unknown as H3Event;

const mockProjectRow = (row: Record<string, unknown>) =>
  mockFetchFromTinybird.mockImplementation((path: string) =>
    Promise.resolve({
      data: path.includes('projects_list')
        ? [{ slug: 'k8s', isLF: 1, repoData: [], repositories: [], ...row }]
        : [],
    }),
  );

describe('GET /api/project/[slug]', () => {
  it('serves the raw v2 score as healthScore', async () => {
    mockProjectRow({
      healthScore: 87.5,
      healthScoreV2: 52,
      healthMaxScore: 65,
      healthLabel: 'excellent',
    });

    const res = await handler(event);

    expect(res).toMatchObject({
      slug: 'k8s',
      healthScore: 52,
      healthScoreV2: 52,
      healthLabel: 'excellent',
    });
  });

  it('returns a null healthScore for a project without a v2 score', async () => {
    mockProjectRow({ healthScoreV2: null, healthMaxScore: null, healthLabel: null });

    const res = await handler(event);

    expect(res).toMatchObject({ healthScore: null, healthLabel: null });
  });
});
