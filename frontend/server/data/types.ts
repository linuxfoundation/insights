import type {DateTime} from "luxon";
import type {ActivityTypes} from "~~/types/shared/activity-types";
import type {ActivityPlatforms} from "~~/types/shared/activity-platforms";

export type FetchFunction = typeof $fetch;

export enum FilterGranularity {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export enum FilterActivityMetric {
  ALL = 'all',
  COMMITS = 'commits',
  ISSUES_OPENED = 'issues-opened',
  ISSUES_CLOSED = 'issues-closed',
  PRS_OPENED = 'pull-requests-opened',
  PRS_CLOSED = 'pull-requests-closed',
  PRS_MERGED = 'pull-requests-merged',
  PRS_REVIEWS = 'pull-requests-reviews',
  PRS_COMMENTS = 'pull-requests-comments'
}

export type ActiveContributorsFilter = {
  project: string;
  repo?: string;
  granularity?: FilterGranularity;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActiveOrganizationsFilter = {
  project: string;
  repository?: string;
  granularity?: FilterGranularity;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ContributorsLeaderboardFilter = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repository?: string;
  limit?: number;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type OrganizationsLeaderboardFilter = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repository?: string;
  limit?: number;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type ContributorDependencyFilter = {
  project: string;
  repository?: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type OrganizationDependencyFilter = {
  project: string;
  repository?: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  startDate?: DateTime;
  endDate?: DateTime;
}

export enum DemographicType {
  CONTRIBUTORS = 'contributors',
  ORGANIZATIONS = 'organizations'
}

export type GeographicDistributionFilter = {
  project: string;
  metric?: FilterActivityMetric;
  repository?: string;
  type?: DemographicType;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type RetentionFilter = {
  project: string;
  granularity: FilterGranularity;
  metric?: FilterActivityMetric;
  repository?: string;
  demographicType?: DemographicType;
  onlyContributions: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
}

export enum ActivityFilterCountType {
  CUMULATIVE = 'cumulative',
  NEW = 'new'
}
export enum ActivityFilterActivityType {
  FORKS = 'fork',
  STARS = 'star'
}
export type ActivityCountFilter = {
  project: string;
  granularity: FilterGranularity;
  countType: ActivityFilterCountType;
  activityType: ActivityFilterActivityType,
  onlyContributions: boolean;
  repository?: string,
  startDate?: DateTime,
  endDate?: DateTime,
}
