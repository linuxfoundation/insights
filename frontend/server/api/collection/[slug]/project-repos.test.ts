// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockPostToTinybird = vi.fn();
const mockFindProjectIdsBySlug = vi.fn();
const mockCreateError = vi.fn((error) => error);

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  postToTinybird: (...args: unknown[]) => mockPostToTinybird(...args),
}));

vi.mock('~~/server/repo/communityCollection.repo', () => ({
  CommunityCollectionRepository: class {
    findProjectIdsBySlug(...args: unknown[]) {
      return mockFindProjectIdsBySlug(...args);
    }
  },
}));

vi.mock('~~/server/utils/jwt', () => ({
  getOptionalUser: vi.fn(() => null),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = mockCreateError;
global.getQuery = vi.fn(() => ({}));

let handler: (event: H3Event) => Promise<unknown>;

beforeAll(async () => {
  const module = await import('./project-repos');
  handler = module.default;
});

beforeEach(() => {
  vi.clearAllMocks();
  mockFindProjectIdsBySlug.mockResolvedValue({ projectIds: ['id-1', 'id-2'], repositoryUrls: [] });
});

function createEvent() {
  return {
    context: { params: { slug: 'some-collection' }, cmDbPool: {} },
  } as unknown as H3Event;
}

describe('IN-1244: kernel health score should be unavailable in collection project-repos', () => {
  it('nulls healthScoreV2/healthLabel only for the kernel item, leaving other items untouched', async () => {
    mockPostToTinybird.mockResolvedValue({
      data: [
        {
          slug: 'the-linux-kernel-organization',
          healthScoreV2: 42,
          healthLabel: 'Fair',
          isLF: true,
          achievements: [],
        },
        {
          slug: 'some-other-project',
          healthScoreV2: 77,
          healthLabel: 'Good',
          isLF: false,
          achievements: [],
        },
      ],
      rows_before_limit_at_least: 2,
    });

    const result = (await handler(createEvent())) as {
      data: { slug: string; healthScoreV2: number | null; healthLabel: string | null }[];
    };

    const kernel = result.data.find((p) => p.slug === 'the-linux-kernel-organization');
    const other = result.data.find((p) => p.slug === 'some-other-project');

    // fails before fix: unfixed code returns the raw Tinybird values (42/'Fair') for Kernel
    expect(kernel?.healthScoreV2).toBeNull();
    expect(kernel?.healthLabel).toBeNull();

    expect(other?.healthScoreV2).toBe(77);
    expect(other?.healthLabel).toBe('Good');
  });
});
