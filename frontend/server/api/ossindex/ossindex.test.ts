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
global.getQuery = vi.fn(() => ({ categoryGroupSlug: 'group' }));

interface MappedProject {
  description: string;
  healthScoreV2: number | null;
  healthLabel: string | null;
  healthMaxScore: number | null;
}
type WithProjects = { topProjects: MappedProject[] };
type Handler<T> = (event: H3Event) => Promise<T>;

let collections: Handler<{ collections: WithProjects[] }>;
let categories: Handler<{ categories: WithProjects[] }>;
let groups: Handler<WithProjects[]>;

beforeAll(async () => {
  collections = (await import('./collections')).default as unknown as typeof collections;
  categories = (await import('./categories')).default as unknown as typeof categories;
  groups = (await import('./groups')).default as unknown as typeof groups;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const collectionRow = (topProjects: unknown[][]) => ({
  id: 'c1',
  name: 'Collection',
  slug: 'collection',
  totalContributors: 1,
  softwareValue: 1,
  avgScore: 1,
  topProjects,
});

describe('OSS index tuple mapping', () => {
  it('maps the collections tuple', async () => {
    mockFetchFromTinybird.mockResolvedValue({
      data: [
        collectionRow([
          ['p1', 10, 'Proj', 'logo', 5, 1, 'desc', 'proj', 'active', 71, 'healthy', 71, 100],
          ['p2', 10, 'Partial', 'logo', 5, 1, 'desc', 'part', 'active', 64, 'excellent', 85, 75],
          ['p3', 10, 'Korg', 'logo', 5, 1, 'desc', 'korg', 'active', null, null, null, null],
        ]),
      ],
    });

    const res = await collections({} as H3Event);
    const [scoredProject, partialProject, unscoredProject] = res.collections[0].topProjects;

    expect(scoredProject).toMatchObject({
      name: 'Proj',
      avgScore: 1,
      description: 'desc',
      slug: 'proj',
      status: 'active',
      healthScoreV2: 71,
      healthLabel: 'healthy',
      healthMaxScore: 100,
    });
    expect(scoredProject).not.toHaveProperty('healthScore');
    expect(partialProject).toMatchObject({
      slug: 'part',
      healthScoreV2: 64,
      healthLabel: 'excellent',
      healthMaxScore: 75,
    });
    expect(unscoredProject).toMatchObject({
      healthScoreV2: null,
      healthLabel: null,
      healthMaxScore: null,
    });
  });

  it('maps the categories tuple', async () => {
    mockFetchFromTinybird
      .mockResolvedValueOnce({ data: [{ id: 'g1', slug: 'group' }] })
      .mockResolvedValueOnce({
        data: [
          {
            ...collectionRow([]),
            topCollections: [],
            topProjects: [['p1', 10, 'Proj', 'logo', 5, 1, 'desc', 40, 'fair', 40, 100]],
          },
        ],
      });

    const res = await categories({} as H3Event);

    expect(res.categories[0].topProjects[0]).toMatchObject({
      avgScore: 1,
      description: 'desc',
      healthScoreV2: 40,
      healthLabel: 'fair',
      healthMaxScore: 100,
    });
  });

  it('maps the groups tuple', async () => {
    mockFetchFromTinybird.mockResolvedValue({
      data: [
        {
          ...collectionRow([]),
          topCollections: [],
          topProjects: [['p1', 10, 'Proj', 'logo', 5, 1, 'desc', 'active', 22, 'critical', 22, 65]],
        },
      ],
    });

    const res = await groups({} as H3Event);

    expect(res[0].topProjects[0]).toMatchObject({
      avgScore: 1,
      description: 'desc',
      status: 'active',
      healthScoreV2: 22,
      healthLabel: 'critical',
      healthMaxScore: 65,
    });
  });
});
