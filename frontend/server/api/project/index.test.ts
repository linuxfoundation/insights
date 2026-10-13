// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockFetchFromTinybird = vi.fn();
let query: Record<string, unknown> = {};

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);
global.getQuery = vi.fn(() => query);

let handler: (event: H3Event) => Promise<{ data: Record<string, unknown>[] }>;

beforeAll(async () => {
  handler = (await import('./index')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
  query = {};
  mockFetchFromTinybird.mockImplementation((_path: string, params: { count?: boolean }) =>
    Promise.resolve({
      data: params.count
        ? [{ 'count(id)': 2 }]
        : [
            { slug: 'k8s', isLF: 1, healthScore: 87.5, healthScoreV2: 52, healthMaxScore: 65 },
            { slug: 'korg', isLF: 0, healthScoreV2: null, healthMaxScore: null },
          ],
    }),
  );
});

describe('GET /api/project', () => {
  it('serves each row raw v2 score as healthScore, or null', async () => {
    const res = await handler({} as H3Event);

    expect(res.data[0]).toMatchObject({ slug: 'k8s', healthScore: 52, healthScoreV2: 52 });
    expect(res.data[1]).toMatchObject({ slug: 'korg', healthScore: null });
  });

  it.each([
    ['healthScore_desc', 'healthScoreV2', 'desc'],
    ['healthScore_asc', 'healthScoreV2', 'asc'],
    ['healthScore', 'healthScoreV2', undefined],
    ['healthScoreV2Normalized', 'healthScoreV2Normalized', undefined],
    ['healthScoreV2Normalized_desc', 'healthScoreV2Normalized', 'desc'],
    ['contributorCount_desc', 'contributorCount', 'desc'],
  ])('sorts %s by %s %s', async (sort, orderByField, orderByDirection) => {
    query = { sort };

    await handler({} as H3Event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/projects_list.json',
      expect.objectContaining({ orderByField, orderByDirection }),
    );
  });
});
