// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {DateTime} from "luxon";
import type {ActivityPlatforms} from "~~/types/shared/activity-platforms";
import type {ActivityTypes} from "~~/types/shared/activity-types";

export type ContributorsLeaderboardTinybirdQuery = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
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
  repos?: string[];
  limit?: number;
  offset?: number;
  count?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type ActivityHeatmapByWeekdayTBQuery = {
  project: string;
  repo?: string,
  startDate?: DateTime,
  endDate?: DateTime,
};

export type SearchVolumeTinybirdQuery = {
  project: string;
  startDate?: DateTime;
  endDate?: DateTime;
}
