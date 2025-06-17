// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import type { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import type { ActivityTypes } from '~~/types/shared/activity-types';

export type FetchFunction = typeof $fetch;

export enum FilterGranularity {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export type DefaultFilter = {
  project: string;
  repo?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

// TODO: refactor all filter types to "inherit" from DefaultFilter
export type ActiveContributorsFilter = DefaultFilter & {
  activity_types?: ActivityTypes[];
  granularity?: FilterGranularity;
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
  activity_types?: ActivityTypes[];
  repo?: string;
  limit?: number;
  offset?: number;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type OrganizationsLeaderboardFilter = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repo?: string;
  limit?: number;
  offset?: number;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ContributorDependencyFilter = {
  project: string;
  repo?: string;
  granularity?: FilterGranularity;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  limit?: number;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type OrganizationDependencyFilter = {
  project: string;
  repo?: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  startDate?: DateTime;
  endDate?: DateTime;
};

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
};

export type RetentionFilter = DefaultFilter & {
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repo?: string;
  demographicType?: DemographicType;
  granularity?: FilterGranularity;
  onlyContributions: boolean;
};

export enum ActivityFilterCountType {
  CUMULATIVE = 'cumulative',
  NEW = 'new'
}

export type ActivityCountFilter = {
  project: string;
  granularity?: FilterGranularity;
  countType?: ActivityFilterCountType;
  activity_type: ActivityTypes;
  onlyContributions: boolean;
  repo?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ReviewTimeByPRSizeFilter = {
  project: string;
  repo?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type AverageTimeToMergeFilter = {
  project: string;
  granularity?: FilterGranularity;
  repo?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type WaitTimeFor1stReviewFilter = {
  project: string;
  granularity?: FilterGranularity;
  repo?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type MergeLeadTimeFilter = {
  project: string;
  repo?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActiveDaysFilter = {
  project: string;
  granularity?: FilterGranularity;
  repo?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type CodeReviewEngagementTBQuery = {
  project: string;
  repo?: string;
  limit: number;
  activity_types: ActivityTypes[];
  startDate: DateTime;
  endDate: DateTime;
};

export type PackageFilter = {
  project: string;
  repo?: string;
  search?: string;
};

export type PackageMetricsFilter = {
  project: string;
  granularity?: FilterGranularity;
  repo?: string;
  ecosystem?: string;
  name?: string;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type SearchVolumeFilter = {
  slug: string;
  startDate?: DateTime;
  endDate?: DateTime;
}
