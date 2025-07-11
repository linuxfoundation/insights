// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import type { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import type { ActivityTypes } from '~~/types/shared/activity-types';
import { Granularity } from "~~/types/shared/granularity";

export type FetchFunction = typeof $fetch;

export type DefaultFilter = {
  project: string;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

// TODO: refactor all filter types to "inherit" from DefaultFilter
export type ActiveContributorsFilter = DefaultFilter & {
  activity_types?: ActivityTypes[];
  granularity?: Granularity;
};

export type ActiveOrganizationsFilter = {
  project: string;
  repos?: string[];
  granularity?: Granularity;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ContributorsLeaderboardFilter = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  repos?: string[];
  limit?: number;
  offset?: number;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type OrganizationsLeaderboardFilter = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repos?: string[];
  limit?: number;
  offset?: number;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ContributorDependencyFilter = {
  project: string;
  repos?: string[];
  granularity?: Granularity;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  limit?: number;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type OrganizationDependencyFilter = {
  project: string;
  repos?: string[];
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
  repos?: string[];
  type?: DemographicType;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type RetentionFilter = DefaultFilter & {
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repos?: string[];
  demographicType?: DemographicType;
  granularity?: Granularity;
  onlyContributions: boolean;
};

export enum ActivityFilterCountType {
  CUMULATIVE = 'cumulative',
  NEW = 'new'
}

export type ActivityCountFilter = {
  project: string;
  granularity?: Granularity;
  countType?: ActivityFilterCountType;
  activity_type: ActivityTypes;
  onlyContributions: boolean;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ReviewTimeByPRSizeFilter = {
  project: string;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

export type AverageTimeToMergeFilter = {
  project: string;
  granularity?: Granularity;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

export type WaitTimeFor1stReviewFilter = {
  project: string;
  granularity?: Granularity;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

export type MergeLeadTimeFilter = {
  project: string;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActiveDaysFilter = {
  project: string;
  granularity?: Granularity;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

export type CodeReviewEngagementTBQuery = {
  project: string;
  repos?: string[];
  limit: number;
  activity_types: ActivityTypes[];
  startDate: DateTime;
  endDate: DateTime;
};

export type PackageFilter = {
  project: string;
  repos?: string[];
  search?: string;
};

export type PackageMetricsFilter = {
  project: string;
  granularity?: Granularity;
  repos?: string[];
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
