// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { HealthScoreTinybird } from '~~/types/overview/responses.types';

import { createHealthScoreSchema, fetchHealthScoreMetrics } from './health-score.helpers';

const mockFetchFromTinybird = vi.fn();

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

const benchmarkPipes = [
  'active_contributors',
  'contributor_dependency',
  'organization_dependency',
  'retention',
  'stars',
  'forks',
  'issues_resolution',
  'pull_requests',
  'merge_lead_time',
  'active_days',
  'search_volume',
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchHealthScoreMetrics', () => {
  it('calls only the benchmark signal pipes and merges their rows', async () => {
    mockFetchFromTinybird.mockImplementation(async (path: string) => ({
      data: [path.includes('stars') ? { stars: 7, starsBenchmark: 3 } : {}],
    }));

    const result = await fetchHealthScoreMetrics({ project: 'k8s' });

    const paths = mockFetchFromTinybird.mock.calls.map(([path]) => path).sort();
    expect(paths).toEqual(
      benchmarkPipes.map((name) => `/v0/pipes/health_score_${name}.json`).sort(),
    );
    expect(result).toMatchObject({ stars: 7, starsBenchmark: 3 });
  });
});

describe('createHealthScoreSchema', () => {
  it('returns only the 11 benchmark keys', () => {
    const schema = createHealthScoreSchema({ stars: 7, starsBenchmark: 3 } as HealthScoreTinybird);

    expect(Object.keys(schema).sort()).toEqual([
      'activeContributors',
      'activeDays',
      'contributorDependency',
      'forks',
      'issuesResolution',
      'mergeLeadTime',
      'organizationDependency',
      'pullRequests',
      'retention',
      'searchQueries',
      'stars',
    ]);
    expect(schema.stars).toEqual({ value: 7, benchmark: 3 });
  });
});
