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

// contributors_leaderboard.pipe is project-only (its collection equivalent is a separate,
// performance-optimized pipe - see CollectionContributorsLeaderboardTinybirdQuery below), so
// this intentionally does NOT extend TinybirdScope.
export type ContributorsLeaderboardTinybirdQuery = {
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
};

// collection_contributors_leaderboard.pipe - the collection-scoped, performance-optimized
// counterpart to contributors_leaderboard.pipe (see that pipe's file for why it's separate).
export type CollectionContributorsLeaderboardTinybirdQuery = {
  collectionSlug: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
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

export type ActivityTypesTinybirdQuery = {
  project: string;
  repos?: string[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  includeOtherContributions?: boolean;
};
