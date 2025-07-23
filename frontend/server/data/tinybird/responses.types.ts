// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// These are the types of the responses from the Tinybird API

import type {DateTime} from "luxon";

export type TinybirdActiveContributorsSummary = {
  contributorCount: number;
}[];

export type TinybirdActiveContributorsData = {
  startDate: string;
  endDate: string;
  contributorCount: number;
}[];

export type TinybirdContributorsLeaderboardData = {
  avatar: string,
  displayName: string,
  contributionCount: number,
  contributionPercentage: number
  roles: string[]
};

export type TinybirdCountData = {
  count: number
};

export type TinybirdContributorDependencyData = {
  displayName: string,
  contributionPercentage: number,
  contributionPercentageRunningTotal: number,
  totalContributorCount: number
};

export type TinybirdOrganizationsLeaderboardData = {
  logo: string,
  displayName: string,
  contributionCount: number,
  contributionPercentage: number
};

export type TinybirdActivityHeatmapData = {
  weekday: number,
  twoHoursBlock: number,
  activityCount: number
};

export type TinybirdSearchVolumeData = {
  projectId: string;
  keyword: string;
  dataTimestamp: string;
  volume: number;
  updatedAt: DateTime;
}

export type TinyBirdActivitiesCountSummaryData = {
  activityCount?: number
};

export type TinyBirdActivitiesCountDataItem = {
  startDate: string,
  endDate: string,
  activityCount?: number
};
