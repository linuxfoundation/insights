// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import type { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import type { ActivityTypes } from '~~/types/shared/activity-types';
import { Granularity } from '~~/types/shared/granularity';

export type FetchFunction = typeof $fetch;

export type DefaultFilter = {
  project: string;
  repos?: string[];
  startDate?: DateTime;
  endDate?: DateTime;
};

// Refactored all filter types to inherit from DefaultFilter
export type ActiveContributorsFilter = DefaultFilter & {
  activity_types?: ActivityTypes[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  granularity?: Granularity;
};

export type ActiveOrganizationsFilter = DefaultFilter & {
  granularity?: Granularity;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
};

export type ContributorsLeaderboardFilter = DefaultFilter & {
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  limit?: number;
  offset?: number;
};

export type OrganizationsLeaderboardFilter = DefaultFilter & {
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  limit?: number;
  offset?: number;
};

export type ContributorDependencyFilter = DefaultFilter & {
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  granularity?: Granularity;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  limit?: number;
};

export type OrganizationDependencyFilter = DefaultFilter & {
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
};

export enum DemographicType {
  CONTRIBUTORS = 'contributors',
  ORGANIZATIONS = 'organizations',
}

export type GeographicDistributionFilter = DefaultFilter & {
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  type?: DemographicType;
};

export type RetentionFilter = DefaultFilter & {
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  repos?: string[];
  demographicType?: DemographicType;
  granularity?: Granularity;
  onlyContributions: boolean;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
};

export enum ActivityFilterCountType {
  CUMULATIVE = 'cumulative',
  NEW = 'new',
}

export type ActivityCountFilter = DefaultFilter & {
  granularity?: Granularity;
  countType?: ActivityFilterCountType;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  onlyContributions: boolean;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
};

export type PatchSetsFilter = DefaultFilter & {
  granularity?: Granularity;
  dataType?: string;
};

export type ReviewTimeByPRSizeFilter = DefaultFilter;

export type MergeLeadTimeFilter = DefaultFilter;

export type ActiveDaysFilter = DefaultFilter & {
  granularity?: Granularity;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
};

export type MedianTimeToCloseFilter = DefaultFilter & {
  granularity?: Granularity;
  platform?: string;
};

export type MedianTimeToReviewFilter = DefaultFilter & {
  granularity?: Granularity;
  platform?: string;
};

export type ReviewEfficiencyFilter = DefaultFilter & {
  granularity?: Granularity;
  platform?: string;
};

export type PackageFilter = DefaultFilter & {
  search?: string;
};

export type PackageMetricsFilter = DefaultFilter & {
  granularity?: Granularity;
  ecosystem?: string;
  name?: string;
};

export type SearchVolumeFilter = DefaultFilter;
