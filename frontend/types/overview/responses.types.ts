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
  sonatypePopularityScore: number | null;
  sonatypePopularityScoreTopPct: number | null;
  sonatypePopularityScoreBand: ImpactBreakdownBand | null;
}

// Flat shape matching the project_insights_health_breakdown.pipe response (mirrors
// ImpactBreakdownResults' flat style, one row per project after the crowd.dev-side rollup).
export interface HealthBreakdownResults {
  // Maintainer
  busFactorScore: number | null;
  busFactorAvailable: boolean | null;
  busFactorCount: number | null;
  orgDiversityScore: number | null;
  orgDiversityAvailable: boolean | null;
  orgCount: number | null;
  responsivenessScore: number | null;
  responsivenessAvailable: boolean | null;
  medianPrResponseS: number | null;
  medianIssueResponseS: number | null;
  isGerrit: boolean | null;
  isExcluded: boolean | null;

  // Security
  openVulnScore: number | null;
  openVulnAvailable: boolean | null;
  openCriticals: number | null;
  openHighs: number | null;
  openModerates: number | null;
  scorecardScorePts: number | null;
  scorecardAvailable: boolean | null;
  scorecardScore: number | null;
  securityPracticesScore: number | null;
  securityPracticesAvailable: boolean | null;
  securityPolicyEnabled: 0 | 1 | null;
  branchProtectionEnabled: 0 | 1 | null;
  branchProtectionRequiredReviews: 0 | 1 | null;
  branchProtectionRequiresStatusChecks: 0 | 1 | null;
  branchProtectionAllowsForcePush: 0 | 1 | null;
  dependencyHealthScore: number | null;
  dependencyHealthAvailable: boolean | null;
  vulnerableDeps: number | null;

  // Development
  releaseCadenceScore: number | null;
  releaseCadenceAvailable: boolean | null;
  daysSinceLatest: number | null;
  daysBetweenRecent: number | null;
  commitActivityScore: number | null;
  commitsLast6m: number | null;
  lastCommitAt: string | null;
  issueResolutionScore: number | null;
  issueResolutionAvailable: boolean | null;
  closed12m: number | null;
  opened12m: number | null;
  medianCloseS: number | null;
  prMergeScore: number | null;
  prMergeAvailable: boolean | null;
  merged12m: number | null;
  closedUnmerged12m: number | null;
  medianMergeS: number | null;
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
