// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { BenchmarkKeys } from '../shared/benchmark.types';

export interface TrustScoreSummary {
  overall: number;
  popularity: number;
  contributors: number;
  security: number;
  development: number;
}

// TODO: move this to overview-api.service.ts after the clean up
export interface HealthScore {
  key: BenchmarkKeys;
  value: number; // this contains the actual value, not the calculated score
  points?: number;
}


export interface HealthScoreBase {
  activeContributors: number;
  activeContributorsBenchmark: number;
  contributorDependencyCount: number;
  contributorDependencyPercentage: number;
  contributorDependencyBenchmark: number;
  organizationDependencyCount: number;
  organizationDependencyPercentage: number;
  organizationDependencyBenchmark: number;
  retentionRate: number;
  retentionBenchmark: number;
  stars: number;
  starsBenchmark: number;
  forks: number;
  forksBenchmark: number;
  issueResolution: number;
  issueResolutionBenchmark: number;
  pullRequests: number;
  pullRequestsBenchmark: number;
  mergeLeadTime: number;
  mergeLeadTimeBenchmark: number;
  activeDaysCount: number;
  activeDaysBenchmark: number;
  contributionsOutsideWorkHours: number;
  contributionsOutsideWorkHoursBenchmark: number;
  searchVolumeAverage: number;
  searchVolumeBenchmark: number;
  securityPercentage: number;
  contributorPercentage: number;
  popularityPercentage: number;
  developmentPercentage: number;
  overallScore: number;
}


export interface HealthScoreTinybird extends HealthScoreBase{
  securityCategoryPercentage: [string, number][];
}

export interface SecurityScore {
  category: string;
  percentage: number;
}

export interface HealthScoreResults {
    activeContributors: {
        benchmark: number;
        value: number;
    };
  contributorDependency: {
    value: number;
    percentage: number;
    benchmark: number;
  };
  organizationDependency: {
    value: number;
    percentage: number;
    benchmark: number;
  };
  retention: {
    value: number;
    benchmark: number;
  };
  stars: {
    value: number;
    benchmark: number;
  };
  forks: {
    value: number;
    benchmark: number;
  };
  issuesResolution: {
    value: number;
    benchmark: number;
  };
  pullRequests: {
    value: number;
    benchmark: number;
  };
  mergeLeadTime: {
    value: number;
    benchmark: number;
  };
  activeDays: {
    value: number;
    benchmark: number;
  };
  contributionsOutsideWorkHours: {
    value: number;
    benchmark: number;
  };
  searchQueries: {
    value: number;
    benchmark: number;
  };
  securityCategoryPercentage: {
    category: string;
    percentage: number;
  }[];
  contributorPercentage: number;
  popularityPercentage: number;
  developmentPercentage: number;
  securityPercentage: number;
  overallScore: number;
}
