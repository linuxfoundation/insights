// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {ActiveContributorsFilter, ContributorsLeaderboardFilter} from "~~/server/data/types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import type {CodeReviewEngagement} from "~~/types/development/responses.types";
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import {calculatePercentageChange, getPreviousDates} from "~~/server/data/util";
import type {
  TinybirdActiveContributorsSummary,
  TinybirdContributorsLeaderboardData
} from "~~/server/data/tinybird/responses.types";
import type {CodeReviewEngagementFilter} from "~~/types/development/requests.types";
import {CodeReviewEngagementMetric} from "~~/types/development/requests.types";

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
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const dates = getPreviousDates(filter.startDate, filter.endDate);

  let activityTypes: ActivityTypes[];
  switch (filter.metric) {
    case CodeReviewEngagementMetric.PR_PARTICIPANTS:
      activityTypes = prParticipantsActivityTypes;
      break;
    case CodeReviewEngagementMetric.REVIEW_COMMENTS:
      activityTypes = reviewCommentsActivityTypes;
      break;
    case CodeReviewEngagementMetric.CODE_REVIEWS:
      activityTypes = codeReviewsActivityTypes;
      break;
    default:
      throw new Error('Invalid metric');
  }

  const currentSummaryQuery: ActiveContributorsFilter = {
    project: filter.project,
    repo: filter.repo,
    activity_types: activityTypes,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const previousSummaryQuery: ActiveContributorsFilter = {
    project: filter.project,
    repo: filter.repo,
    activity_types: activityTypes,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  const dataQuery: ContributorsLeaderboardFilter = {
    project: filter.project,
    repo: filter.repo,
    limit: 5,
    activity_types: activityTypes,
    startDate: filter.startDate,
    endDate: filter.endDate
  };

  const summariesPath = '/v0/pipes/active_contributors.json';
  const dataPath = '/v0/pipes/contributors_leaderboard.json';
  const [
    currentSummary,
    previousSummary,
    codeReviewEngagementData
  ] = await Promise.all([
    fetchFromTinybird<TinybirdActiveContributorsSummary>(summariesPath, currentSummaryQuery),
    fetchFromTinybird<TinybirdActiveContributorsSummary>(summariesPath, previousSummaryQuery),
    fetchFromTinybird<TinybirdContributorsLeaderboardData[]>(dataPath, dataQuery),
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
