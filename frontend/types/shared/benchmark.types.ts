// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
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
  Stars = 'stars',
  Forks = 'forks',
  IssuesResolution = 'issues-resolution',
  CommitActivities = 'commit-activities',
  PullRequests = 'pull-requests',
  ActiveDays = 'active-days',
  MergeLeadTime = 'merge-lead-time',
  MailingListsMessages = 'mailing-lists-messages',
  ContributionsOutsideWorkHours = 'contributions-outside-work-hours'
}

export interface Benchmark {
  key: BenchmarkKeys;
  value: number;
  additionalCheck?: boolean;
}

export interface BenchmarkPoints {
  pointStart: number; // start of the range of values that this point is valid for
  pointEnd: number | null; // end of the range of values that this point is valid for
  type: BenchmarkType;
  description: string;
  text: string;
  points: number;
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

export type AggregateKey = 'contributors' | 'popularity' | 'development' | 'security';
