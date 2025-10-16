// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {DateTime} from "luxon";
import type {ActivityPlatforms} from "~~/types/shared/activity-platforms";
import type {ActivityTypes} from "~~/types/shared/activity-types";
import type {Granularity} from "~~/types/shared/granularity";

/*
 * These are the types that the Tinybird API expects to receive.
 * They don't necessarily match the types that the frontend uses because they are only meant to be used with TinyBird.
 */


export type ContributorsLeaderboardTinybirdQuery = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  includeCodeContributions?: boolean,
  includeCollaborations?: boolean,
  repos?: string[];
  limit?: number;
  offset?: number;
  count?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type OrganizationsLeaderboardTinybirdQuery = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  repos?: string[];
  limit?: number;
  offset?: number;
  count?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type ActivityHeatmapByWeekdayTBQuery = {
  project: string;
  repos?: string[],
  includeCodeContributions?: boolean,
  includeCollaborations?: boolean,
  startDate?: DateTime,
  endDate?: DateTime,
};

export type SearchVolumeTinybirdQuery = {
  project: string;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type ActiveContributorsTinybirdQuery = {
  project: string;
  repos?: string[];
  granularity?: Granularity;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  count?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActivitiesCountTinybirdQuery = {
  project: string;
  repos?: string[];
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  granularity?: Granularity;
  onlyContributions?: boolean;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type ActivityTypesTinybirdQuery = {
  project: string;
  repos?: string[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  includeOtherContributions?: boolean;
}
