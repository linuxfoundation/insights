// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {ActivityTypes} from "~~/types/shared/activity-types";
import type {CodeReviewEngagement} from "~~/types/development/responses.types";
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import {calculatePercentageChange, getPreviousDates} from "~~/server/data/util";
import {
  TinybirdActiveContributorsSummary,
  TinyBirdActivitiesCountDataItem, TinyBirdActivitiesCountSummaryData,
  TinybirdContributorsLeaderboardData
} from "~~/server/data/tinybird/responses.types";
import type {CodeReviewEngagementFilter} from "~~/types/development/requests.types";
import {CodeReviewEngagementMetric} from "~~/types/development/requests.types";
import {
  ActiveContributorsTinybirdQuery,
  ActivitiesCountTinybirdQuery,
  ContributorsLeaderboardTinybirdQuery
} from "~~/server/data/tinybird/requests.types";

const prParticipantsActivityTypes = [
  ActivityTypes.PULL_REQUEST_REVIEWED,
  ActivityTypes.PULL_REQUEST_ASSIGNED,
  ActivityTypes.PULL_REQUEST_COMMENT,
  ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
  ActivityTypes.PULL_REQUEST_OPENED,
  ActivityTypes.PULL_REQUEST_REVIEW_REQUESTED,
];

const reviewCommentsActivityTypes = [
  ActivityTypes.PULL_REQUEST_COMMENT,
  ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
];

const codeReviewsActivityTypes = [
  ActivityTypes.PULL_REQUEST_REVIEWED,
];

export async function fetchCodeReviewEngagement(filter: CodeReviewEngagementFilter): Promise<CodeReviewEngagement> {
  switch (filter.metric) {
    case CodeReviewEngagementMetric.PR_PARTICIPANTS:
      return await getParticipantsData(filter);
    case CodeReviewEngagementMetric.REVIEW_COMMENTS:
      return await getCommentsData(filter);
    case CodeReviewEngagementMetric.CODE_REVIEWS:
      return await getReviewsData(filter);
    default:
      throw new Error('Invalid metric');
  }
}

async function getParticipantsData(filter: CodeReviewEngagementFilter): Promise<CodeReviewEngagement> {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const currentSummaryQuery: ActiveContributorsTinybirdQuery = {
    project: filter.project,
    repos: filter.repos,
    activity_types: prParticipantsActivityTypes,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const previousSummaryQuery: ActiveContributorsTinybirdQuery = {
    ...currentSummaryQuery,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  const dataQuery: ContributorsLeaderboardTinybirdQuery = {
    ...currentSummaryQuery,
    limit: 5,
  };

  const [
    currentSummary,
    previousSummary,
    codeReviewEngagementData
  ] = await Promise.all([
    fetchFromTinybird<TinybirdActiveContributorsSummary>('/v0/pipes/active_contributors.json', currentSummaryQuery),
    fetchFromTinybird<TinybirdActiveContributorsSummary>('/v0/pipes/active_contributors.json', previousSummaryQuery),
    fetchFromTinybird<TinybirdContributorsLeaderboardData[]>('/v0/pipes/contributors_leaderboard.json', dataQuery),
  ]);

  const currentCount = currentSummary.data[0]?.contributorCount || 0;
  const previousCount = previousSummary.data[0]?.contributorCount || 0;

  return {
    summary: {
      current: currentCount,
      previous: previousCount,
      percentageChange: calculatePercentageChange(currentCount, previousCount),
      changeValue: currentCount - previousCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: codeReviewEngagementData.data.map((item) => ({
      avatar: item.avatar,
      name: item.displayName,
      activityCount: item.contributionCount,
      percentage: item.contributionPercentage,
      roles: item.roles || [],
    }))
  };
}

async function getCommentsData(filter: CodeReviewEngagementFilter): Promise<CodeReviewEngagement> {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const currentSummaryQuery: ActivitiesCountTinybirdQuery = {
    project: filter.project,
    repos: filter.repos,
    activity_types: reviewCommentsActivityTypes,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const previousSummaryQuery: ActivitiesCountTinybirdQuery = {
    ...currentSummaryQuery,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  // Default to Participants query, otherwise create a query for the comments or reviews
  const dataQuery: ActivitiesCountTinybirdQuery = {
    ...currentSummaryQuery,
    granularity: filter.granularity,
  };

  const [
    currentSummary,
    previousSummary,
    data
  ] = await Promise.all([
    fetchFromTinybird<TinyBirdActivitiesCountSummaryData[]>('/v0/pipes/activities_count.json', currentSummaryQuery),
    fetchFromTinybird<TinyBirdActivitiesCountSummaryData[]>('/v0/pipes/activities_count.json', previousSummaryQuery),
    fetchFromTinybird<TinyBirdActivitiesCountDataItem[]>('/v0/pipes/activities_count.json', dataQuery),
  ]);

  const currentCount = currentSummary.data[0]?.activityCount || 0;
  const previousCount = previousSummary.data[0]?.activityCount || 0;

  return {
    summary: {
      current: currentCount,
      previous: previousCount,
      percentageChange: calculatePercentageChange(currentCount, previousCount),
      changeValue: currentCount - previousCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: data.data.map((item: TinyBirdActivitiesCountDataItem) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      comments: item.activityCount || 0,
    }))
  };
}

async function getReviewsData(filter: CodeReviewEngagementFilter): Promise<CodeReviewEngagement> {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const currentSummaryQuery: ActivitiesCountTinybirdQuery = {
    project: filter.project,
    repos: filter.repos,
    activity_types: codeReviewsActivityTypes,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const previousSummaryQuery: ActivitiesCountTinybirdQuery = {
    ...currentSummaryQuery,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  // Default to Participants query, otherwise create a query for the comments or reviews
  const dataQuery: ActivitiesCountTinybirdQuery = {
    ...currentSummaryQuery,
    granularity: filter.granularity,
  };

  const [
    currentSummary,
    previousSummary,
    data
  ] = await Promise.all([
    fetchFromTinybird<TinyBirdActivitiesCountSummaryData[]>('/v0/pipes/activities_count.json', currentSummaryQuery),
    fetchFromTinybird<TinyBirdActivitiesCountSummaryData[]>('/v0/pipes/activities_count.json', previousSummaryQuery),
    fetchFromTinybird<TinyBirdActivitiesCountDataItem[]>('/v0/pipes/activities_count.json', dataQuery),
  ]);

  const currentCount = currentSummary.data[0]?.activityCount || 0;
  const previousCount = previousSummary.data[0]?.activityCount || 0;

  return {
    summary: {
      current: currentCount,
      previous: previousCount,
      percentageChange: calculatePercentageChange(currentCount, previousCount),
      changeValue: currentCount - previousCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: data.data.map((item: TinyBirdActivitiesCountDataItem) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      reviews: item.activityCount || 0,
    }))
  };
}