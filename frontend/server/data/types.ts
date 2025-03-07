import type {DateTime} from "luxon";

export type FetchFunction = typeof $fetch;

export enum ContributorsFilterGranularity {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}
export type ActiveContributorsFilter = {
  project: string;
  repo?: string;
  granularity?: ContributorsFilterGranularity;
  startDate?: DateTime;
  endDate?: DateTime;
};

export enum ActiveOrganizationsFilterGranularity {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}
export type ActiveOrganizationsFilter = {
  project: string;
  repository?: string;
  granularity?: ActiveOrganizationsFilterGranularity;
  startDate?: DateTime;
  endDate?: DateTime;
};

export enum ContributorsLeaderboardFilterMetric {
  ALL = 'all',
  COMMITS = 'commits'
}
export type ContributorsLeaderboardFilter = {
  metric: ContributorsLeaderboardFilterMetric;
  repository: string;
  startDate?: DateTime;
  endDate?: DateTime;
}

export enum OrganizationsLeaderboardFilterMetric {
  ALL = 'all',
  COMMITS = 'commits'
}
export type OrganizationsLeaderboardFilter = {
  metric: OrganizationsLeaderboardFilterMetric;
  repository: string;
  startDate?: DateTime;
  endDate?: DateTime;
}
