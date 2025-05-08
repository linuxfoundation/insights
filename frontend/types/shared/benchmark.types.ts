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
  GeographicalDistribution = 'geographical-distribution',
  Stars = 'stars',
  Forks = 'forks',
  IssuesResolution = 'issues-resolution',
  PullRequests = 'pull-requests',
  ActiveDays = 'active-days',
  MergeLeadTime = 'merge-lead-time',
  MailingListsMessages = 'mailing-lists-messages',
}

export interface Benchmark {
  key: BenchmarkKeys;
  value: number;
  additionalCheck?: boolean;
}

export interface BenchmarkPoints {
  pointStart: number;
  pointEnd: number | null;
  type: BenchmarkType;
  description: string;
  text: string;
}

export interface BenchmarkConfigs {
  title: string;
  key: BenchmarkKeys;
  points: BenchmarkPoints[];
  visibilityCheck: (
    selectedTimeRangeKey: string,
    startDate: string,
    endDate: string,
    additionalCheck?: boolean
  ) => boolean;
}

export interface ScoreData {
  benchmarkKey: BenchmarkKeys;
  value: number;
}
