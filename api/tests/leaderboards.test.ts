// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import {
  isEntryRow,
  leaderboardTypes,
  LeaderboardStatus,
  LeaderboardType,
  toEntry,
} from '../src/lib/leaderboards.js';

const types = [
  'contributors',
  'organizations',
  'active-contributors',
  'active-organizations',
  'commit-activity',
  'stars',
  'forks',
  'package-downloads',
  'codebase-size',
  'fastest-responders',
  'fastest-mergers',
  'focused-teams',
  'resolution-rate',
  'small-teams-massive-output',
];

const row = {
  rank: 3,
  id: 'id-1',
  segmentId: 'segment-1',
  name: 'Kubernetes',
  slug: 'kubernetes',
  logoUrl: 'https://logos.test/k8s.png',
  leaderboardType: 'stars',
  value: 120000,
  previousPeriodValue: 110000,
  collectionsSlugs: ['cncf', 'mine'],
  isLF: 1,
  githubHandleArray: [],
  status: 'active',
  totalCount: 5000,
};

describe('LeaderboardType (AC1)', () => {
  it('publishes the 14 types in the data as a string enum', () => {
    expect(LeaderboardType).toMatchObject({ type: 'string', enum: types });
  });
});

describe('leaderboardTypes catalog (AC2)', () => {
  it('has one entry per type, in enum order', () => {
    expect(leaderboardTypes.map((entry) => entry.type)).toEqual(types);
  });

  it.each(types)('%s names its entity and unit', (type) => {
    const entry = leaderboardTypes.find((item) => item.type === type)!;
    expect(['project', 'contributor', 'organization']).toContain(entry.entityType);
    expect(['count', 'seconds', 'ratio', 'lines']).toContain(entry.metricUnit);
  });

  it('ranks people and companies on contributors and organizations, projects elsewhere', () => {
    const entities = Object.fromEntries(leaderboardTypes.map((e) => [e.type, e.entityType]));
    expect(entities).toMatchObject({ contributors: 'contributor', organizations: 'organization' });
    const projects = types.filter((type) => !['contributors', 'organizations'].includes(type));
    for (const type of projects) {
      expect(entities[type], type).toBe('project');
    }
  });

  it('measures time in seconds, resolution rate as a ratio and codebase size in lines', () => {
    const units = Object.fromEntries(leaderboardTypes.map((e) => [e.type, e.metricUnit]));
    expect(units).toEqual({
      contributors: 'count',
      organizations: 'count',
      'active-contributors': 'count',
      'active-organizations': 'count',
      'commit-activity': 'count',
      stars: 'count',
      forks: 'count',
      'package-downloads': 'count',
      'codebase-size': 'lines',
      'fastest-responders': 'seconds',
      'fastest-mergers': 'seconds',
      'focused-teams': 'count',
      'resolution-rate': 'ratio',
      'small-teams-massive-output': 'count',
    });
  });

  it('sets eligibility only on the two types that limit who can rank', () => {
    const limited = leaderboardTypes.filter((e) => e.eligibility !== null).map((e) => e.type);
    expect(limited.sort()).toEqual(['focused-teams', 'small-teams-massive-output']);
  });
});

describe('LeaderboardStatus', () => {
  it('publishes the project statuses in the data, nullable', () => {
    expect(LeaderboardStatus).toMatchObject({ enum: ['active', 'archived', 'formation', null] });
  });
});

describe('isEntryRow (AC4)', () => {
  it('accepts a well-formed row', () => {
    expect(isEntryRow(row)).toBe(true);
  });

  it.each([
    ['a contributor row with empty slug and status', { ...row, slug: '', status: '' }],
    ['a negative previousPeriodValue', { ...row, previousPeriodValue: -1844770272 }],
    ['an overflowed value', { ...row, value: 1.8446744073709552e19 }],
    ['isLF 0', { ...row, isLF: 0 }],
    ['an empty logoUrl', { ...row, logoUrl: '' }],
  ])('accepts %s', (_, good) => {
    expect(isEntryRow(good)).toBe(true);
  });

  it.each([
    ['null', null],
    ['an array', []],
    ['rank 0', { ...row, rank: 0 }],
    ['a fractional rank', { ...row, rank: 1.5 }],
    ['a non-string id', { ...row, id: 7 }],
    ['a non-string name', { ...row, name: null }],
    ['a non-string slug', { ...row, slug: null }],
    ['a non-string logoUrl', { ...row, logoUrl: 3 }],
    ['a non-finite value', { ...row, value: Number.NaN }],
    ['a string value', { ...row, value: '12' }],
    ['an infinite previousPeriodValue', { ...row, previousPeriodValue: Number.POSITIVE_INFINITY }],
    ['isLF 2', { ...row, isLF: 2 }],
    ['a boolean isLF', { ...row, isLF: true }],
    ['an off-enum status', { ...row, status: 'deprecated' }],
    ['a non-array githubHandleArray', { ...row, githubHandleArray: 'handle' }],
    ['a non-string handle', { ...row, githubHandleArray: [1] }],
    ['a negative totalCount', { ...row, totalCount: -1 }],
    ['a fractional totalCount', { ...row, totalCount: 2.5 }],
  ])('rejects %s', (_, bad) => {
    expect(isEntryRow(bad as never)).toBe(false);
  });
});

describe('toEntry (AC3)', () => {
  it('maps a project row and drops the internal and collection columns', () => {
    expect(toEntry(row)).toEqual({
      rank: 3,
      id: 'id-1',
      name: 'Kubernetes',
      slug: 'kubernetes',
      logoUrl: 'https://logos.test/k8s.png',
      value: 120000,
      previousPeriodValue: 110000,
      isLF: true,
      status: 'active',
      githubHandles: [],
      totalCount: 5000,
    });
  });

  it('answers empty strings as null and keeps a contributor handles', () => {
    const contributor = {
      ...row,
      slug: '',
      logoUrl: '',
      status: '',
      isLF: 0,
      githubHandleArray: ['octocat'],
    };
    expect(toEntry(contributor)).toMatchObject({
      slug: null,
      logoUrl: null,
      status: null,
      isLF: false,
      githubHandles: ['octocat'],
    });
  });
});
