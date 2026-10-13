// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockPostToTinybird = vi.fn();

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  postToTinybird: (...args: unknown[]) => mockPostToTinybird(...args),
}));
vi.mock('~~/server/repo/communityCollection.repo', () => ({
  CommunityCollectionRepository: class {
    findProjectIdsBySlug = () =>
      Promise.resolve({
        collectionId: 'c1',
        projectIds: ['p1'],
        repositoryUrls: ['https://github.com/kubernetes/kubectl'],
      });
  },
}));
vi.mock('~~/server/utils/jwt', () => ({ getOptionalUser: () => null }));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);
let query: Record<string, unknown> = {};
global.getQuery = vi.fn(() => query);

type Handler = (event: H3Event) => Promise<{ data: Record<string, unknown>[] }>;
const handlers: Record<string, Handler> = {};

beforeAll(async () => {
  handlers.projects = (await import('./projects')).default as unknown as Handler;
  handlers['project-repos'] = (await import('./project-repos')).default as unknown as Handler;
});

beforeEach(() => {
  vi.clearAllMocks();
  query = {};
  mockPostToTinybird.mockResolvedValue({
    rows: 2,
    data: [
      {
        type: 'project',
        slug: 'k8s',
        isLF: 1,
        healthScore: 86,
        healthScoreV2: 71,
        achievements: [],
      },
      {
        type: 'repo',
        repoUrl: 'https://github.com/kubernetes/kubectl',
        isLF: 1,
        healthScoreV2: null,
        achievements: [],
      },
    ],
  });
});

const event = { context: { params: { slug: 'cncf' }, cmDbPool: {} } } as unknown as H3Event;

describe.each(['projects', 'project-repos'])('GET /api/collection/[slug]/%s', (route) => {
  it('serves each row raw v2 score as healthScore, or null', async () => {
    const res = await handlers[route](event);

    expect(res.data[0]).toMatchObject({ slug: 'k8s', healthScore: 71, healthScoreV2: 71 });
    expect(res.data[1]).toMatchObject({ type: 'repo', healthScore: null });
  });

  it.each([
    ['healthScore_desc', 'healthScoreV2', 'desc'],
    ['healthScore_asc', 'healthScoreV2', 'asc'],
    ['healthScore', 'healthScoreV2', 'desc'],
    ['healthScoreV2Normalized_desc', 'healthScoreV2Normalized', 'desc'],
    ['contributorCount_asc', 'contributorCount', 'asc'],
  ])('sorts %s by %s %s', async (sort, orderByField, orderByDirection) => {
    query = { sort };

    await handlers[route](event);

    expect(mockPostToTinybird).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ orderByField, orderByDirection }),
    );
  });
});
