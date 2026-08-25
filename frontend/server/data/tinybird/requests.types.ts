// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import type { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import type { ActivityTypes } from '~~/types/shared/activity-types';
import type { Granularity } from '~~/types/shared/granularity';

/*
 * These are the types that the Tinybird API expects to receive.
 * They don't necessarily match the types that the frontend uses because they are only meant to be used with TinyBird.
 */

// Exactly one of project/collectionSlug is sent per request - see segments_filtered /
// segments_filtered_by_collection on the Tinybird side.
export type TinybirdScope = {
  project?: string;
  collectionSlug?: string;
};

// contributors_leaderboard.pipe supports both project and collectionSlug scope (scalar-total
// pattern, same performance characteristics at collection scale as the leaderboard's own
// window-function-free design).
export type ContributorsLeaderboardTinybirdQuery = TinybirdScope & {
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
};

export type OrganizationsLeaderboardTinybirdQuery = TinybirdScope & {
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
};

export type ActivityHeatmapByWeekdayTBQuery = TinybirdScope & {
  repos?: string[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type SearchVolumeTinybirdQuery = TinybirdScope & {
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActiveContributorsTinybirdQuery = TinybirdScope & {
  repos?: string[];
  granularity?: Granularity;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  count?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActivitiesCountTinybirdQuery = TinybirdScope & {
  repos?: string[];
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  granularity?: Granularity;
  onlyContributions?: boolean;
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActivityTypesTinybirdQuery = TinybirdScope & {
  repos?: string[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  includeOtherContributions?: boolean;
};
