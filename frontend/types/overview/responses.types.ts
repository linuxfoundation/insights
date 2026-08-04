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

export interface HealthScoreV2Results {
  healthScoreV2: number | null;
  healthLabel: string | null;
  lifecycleLabel: string | null;
  impactScore: number | null;
  impactLabel: string | null;
  maintainerHealthScoreV2: number | null;
  securitySupplyChainScoreV2: number | null;
  developmentActivityScoreV2: number | null;
}

export type ImpactBreakdownBand = 'Top 1%' | 'Top 10%' | 'Top 25%' | 'Top 50%' | 'Bottom 50%';

export interface ImpactBreakdownResults {
  directDependents: number | null;
  directDependentsTopPct: number | null;
  directDependentsBand: ImpactBreakdownBand | null;
  transitiveDependents: number | null;
  transitiveDependentsTopPct: number | null;
  transitiveDependentsBand: ImpactBreakdownBand | null;
  downloads: number | null;
  downloadsTopPct: number | null;
  downloadsBand: ImpactBreakdownBand | null;
  centrality: number | null;
  centralityTopPct: number | null;
  centralityBand: ImpactBreakdownBand | null;
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
