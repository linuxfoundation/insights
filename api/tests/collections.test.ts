// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import {
  type CollectionProjectRow,
  type CollectionRow,
  isCollectionProjectRow,
  toCollection,
  toCollectionProject,
} from '../src/lib/collections.js';

const collectionRow: CollectionRow = {
  id: '0b6f3a4e-9c1d-4f2a-8e3b-5d7c9a1b2c3d',
  name: 'CNCF',
  slug: 'cncf',
  description: 'Cloud native projects.',
  ssoUserId: null,
  logoUrl: 'https://logos.test/cncf.png',
  imageUrl: '',
  color: '#0094FF',
  createdAt: new Date('2025-01-02T03:04:05Z'),
  updatedAt: new Date('2025-06-07T08:09:10Z'),
  ownerName: null,
  ownerLogo: null,
  projectCount: 2,
  repositoryCount: 1,
  likeCount: 7,
  featuredProjects: [{ name: 'Kubernetes', slug: 'kubernetes', logoUrl: '' }],
};

// A real project_repo_insights row, trimmed to the columns the mapper reads.
const projectRow: CollectionProjectRow = {
  id: '7e8ad4c2-0c87-4c8b-ab40-fdd33ca4b21a',
  type: 'project',
  repoUrl: '',
  name: 'Visual Studio Code',
  slug: 'microsoft-vscode',
  logoUrl: 'https://avatars.githubusercontent.com/u/6154722?v=4',
  isLF: 0,
  status: 'active',
  contributorCount: 136853,
  organizationCount: 21678,
  softwareValue: 153463468,
  contributorDependencyCount: 15,
  contributorDependencyPercentage: 51,
  organizationDependencyCount: 1,
  organizationDependencyPercentage: 94,
  achievements: [
    ['commit-activity', 30, 10059],
    ['forks', 12, 10970],
  ],
  healthScoreV2: 77,
  healthLabel: 'healthy',
  healthMaxScore: 100,
  maintainerHealthScoreV2: 40,
  securitySupplyChainScoreV2: 16,
  developmentActivityScoreV2: 21,
  lifecycleLabel: 'active',
  impactScore: 5,
  impactLabel: 'minor',
};

describe('toCollection', () => {
  it('maps a curated row to the collection schema', () => {
    const collection = toCollection(collectionRow);

    expect(collection).toEqual({
      id: collectionRow.id,
      name: 'CNCF',
      slug: 'cncf',
      description: 'Cloud native projects.',
      type: 'curated',
      projectCount: 2,
      repositoryCount: 1,
      likeCount: 7,
      featuredProjects: [{ name: 'Kubernetes', slug: 'kubernetes', logoUrl: null }],
      owner: null,
      logoUrl: 'https://logos.test/cncf.png',
      imageUrl: null,
      color: '#0094FF',
      createdAt: '2025-01-02T03:04:05.000Z',
      updatedAt: '2025-06-07T08:09:10.000Z',
    });
  });

  it('marks a row with an owner as community and exposes the owner', () => {
    const collection = toCollection({
      ...collectionRow,
      ssoUserId: 'auth0|user',
      ownerName: 'Jane',
      ownerLogo: '',
    });

    expect(collection.type).toBe('community');
    expect(collection.owner).toEqual({ name: 'Jane', logoUrl: null });
    expect(collection).not.toHaveProperty('ssoUserId');
  });

  it('leaves owner null when the owner has no display name', () => {
    const collection = toCollection({ ...collectionRow, ssoUserId: 'auth0|gone' });

    expect(collection.type).toBe('community');
    expect(collection.owner).toBeNull();
  });
});

describe('isCollectionProjectRow', () => {
  it('accepts a pipe row, including a repository with empty achievements', () => {
    expect(isCollectionProjectRow(projectRow)).toBe(true);
    expect(
      isCollectionProjectRow({
        ...projectRow,
        type: 'repo',
        repoUrl: 'https://github.com/microsoft/vscode',
        achievements: [],
        healthMaxScore: null,
        status: '',
      }),
    ).toBe(true);
  });

  it.each([
    ['an unknown type', { type: 'org' }],
    ['a non-boolean isLF', { isLF: 2 }],
    ['an off-enum status', { status: 'retired' }],
    ['an off-enum health label', { healthLabel: 'great' }],
    ['an unknown leaderboard type', { achievements: [['unknown', 1, 10]] }],
    ['a zero rank', { achievements: [['forks', 0, 10]] }],
    ['a fractional count', { contributorCount: 1.5 }],
    ['a quoted number', { softwareValue: '153463468' }],
    ['a non-string status', { status: 5 }],
    ['a score above its maximum', { maintainerHealthScoreV2: 41 }],
    ['a supply chain score above 35', { securitySupplyChainScoreV2: 36 }],
    ['a development activity score above 25', { developmentActivityScoreV2: 26 }],
    ['an impact score above 100', { impactScore: 101 }],
    ['a health score above 100', { healthScoreV2: 101 }],
    ['an unknown health maximum', { healthMaxScore: 80 }],
    ['a health score above the health maximum', { healthScoreV2: 70, healthMaxScore: 60 }],
  ])('rejects %s', (_, change) => {
    expect(isCollectionProjectRow({ ...projectRow, ...change })).toBe(false);
  });

  it('rejects anything that is not an object', () => {
    expect(isCollectionProjectRow(null)).toBe(false);
    expect(isCollectionProjectRow([projectRow])).toBe(false);
  });
});

describe('toCollectionProject', () => {
  it('maps achievement tuples to objects and drops the V2 suffix', () => {
    expect(toCollectionProject(projectRow)).toEqual({
      id: projectRow.id,
      type: 'project',
      name: 'Visual Studio Code',
      slug: 'microsoft-vscode',
      repoUrl: null,
      logoUrl: 'https://avatars.githubusercontent.com/u/6154722?v=4',
      isLF: false,
      status: 'active',
      contributorCount: 136853,
      organizationCount: 21678,
      softwareValue: 153463468,
      contributorDependencyCount: 15,
      contributorDependencyPercentage: 51,
      organizationDependencyCount: 1,
      organizationDependencyPercentage: 94,
      achievements: [
        { leaderboardType: 'commit-activity', rank: 30, totalCount: 10059 },
        { leaderboardType: 'forks', rank: 12, totalCount: 10970 },
      ],
      healthScore: 77,
      healthLabel: 'healthy',
      healthMaxScore: 100,
      maintainerHealthScore: 40,
      securitySupplyChainScore: 16,
      developmentActivityScore: 21,
      lifecycleLabel: 'active',
      impactScore: 5,
      impactLabel: 'minor',
    });
  });

  it('maps empty pipe strings to null', () => {
    const project = toCollectionProject({ ...projectRow, logoUrl: '', status: '' });

    expect(project.logoUrl).toBeNull();
    expect(project.status).toBeNull();
  });
});
