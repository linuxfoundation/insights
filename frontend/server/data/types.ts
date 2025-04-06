import type {DateTime} from "luxon";
import type {ActivityPlatforms} from "~~/types/shared/activity-platforms";
import type {ActivityTypes} from "~~/types/shared/activity-types";

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
  repo?: string;
  granularity?: FilterGranularity;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ContributorsLeaderboardFilter = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repo?: string;
  limit?: number;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type OrganizationsLeaderboardFilter = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repo?: string;
  limit?: number;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type ContributorDependencyFilter = {
  project: string;
  repo?: string;
  granularity?: FilterGranularity;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type OrganizationDependencyFilter = {
  project: string;
  repo?: string;
  granularity?: FilterGranularity;
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
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repo?: string;
  type?: DemographicType;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type RetentionFilter = {
  project: string;
  granularity: FilterGranularity;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repo?: string;
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
  STARS = 'star',
  ISSUES_OPENED = 'issues-opened',
  ISSUES_CLOSED = 'issues-closed',
  PULL_REQUESTS_OPENED = 'pull_request-opened',
  PULL_REQUESTS_MERGED = 'pull_request-merged',
  PULL_REQUESTS_CLOSED = 'pull_request-closed',
}
export type ActivityCountFilter = {
  project: string;
  granularity?: FilterGranularity;
  countType?: ActivityFilterCountType;
  activity_type: ActivityFilterActivityType,
  onlyContributions: boolean;
  repo?: string,
  startDate?: DateTime,
  endDate?: DateTime,
}

export type WaitTimeFor1stReviewFilter = {
  project: string;
  granularity?: FilterGranularity;
  repo?: string,
  startDate?: DateTime,
  endDate?: DateTime,
};

