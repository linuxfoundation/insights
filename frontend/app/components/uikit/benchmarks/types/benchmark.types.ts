export const benchmarkTypes = ['positive', 'warning', 'negative'] as const;

export type BenchmarkType = (typeof benchmarkTypes)[number];

export enum BenchmarkKeys {
  ContributorsLeaderboard = 'contributors-leaderboard',
  OrganizationsLeaderboard = 'organizations-leaderboard',
  ActiveContributors = 'active-contributors',
  ActiveOrganizations = 'active-organizations',
  ContributorDependency = 'contributor-dependency',
  OrganizationDependency = 'organization-dependency',
  Retention = 'retention',
  GeographicalDistribution = 'geographical-distribution'
}

export interface Benchmark {
  key: BenchmarkKeys;
  value: number;
}
