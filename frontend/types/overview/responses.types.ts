// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface TrustScoreSummary {
  overall: number;
  popularity: number;
  contributors: number;
  security: number;
  development: number;
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

export interface HealthScoreTinybird extends HealthScoreBase {
  securityCategoryPercentage: [string, number][];
}

export interface SecurityScore {
  category: string;
  percentage: number;
}

export interface BenchmarkScoreData {
  value: number;
  benchmark: number;
  percentage?: number;
}

export interface HealthScoreResults {
  activeContributors: BenchmarkScoreData;
  contributorDependency: BenchmarkScoreData;
  organizationDependency: BenchmarkScoreData;
  retention: BenchmarkScoreData;
  stars: BenchmarkScoreData;
  forks: BenchmarkScoreData;
  issuesResolution: BenchmarkScoreData;
  pullRequests: BenchmarkScoreData;
  mergeLeadTime: BenchmarkScoreData;
  activeDays: BenchmarkScoreData;
  contributionsOutsideWorkHours: BenchmarkScoreData;
  searchQueries: BenchmarkScoreData;
  securityCategoryPercentage: SecurityScore[];
  contributorPercentage: number;
  popularityPercentage: number;
  developmentPercentage: number;
  securityPercentage: number;
  overallScore: number;
}
