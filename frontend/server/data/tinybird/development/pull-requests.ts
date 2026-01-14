// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ActivityCountFilter } from '../../types';
import { fetchFromTinybird } from '../tinybird';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { PullRequests } from '~~/types/development/responses.types';

// This is the data part of the response from Tinybird
type TinybirdActivityCountData = {
  startDate: string;
  endDate: string;
  activityCount?: number;
  cumulativeActivityCount?: number;
};

type TinybirdActivityCountSummary = {
  activityCount: number;
};

type TinybirdPullRequestResolutionVelocityData = {
  averagePullRequestResolveVelocitySeconds: number;
};

function getTinybirdQueries(filter: ActivityCountFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const openedPRsActivities = [
    ActivityTypes.PULL_REQUEST_OPENED,
    ActivityTypes.MERGE_REQUEST_OPENED,
    ActivityTypes.CHANGESET_CREATED,
  ];

  const mergedPRsActivities = [
    ActivityTypes.PULL_REQUEST_MERGED,
    ActivityTypes.MERGE_REQUEST_MERGED,
    ActivityTypes.CHANGESET_MERGED,
  ];

  const closedPRsActivities = [
    ActivityTypes.PULL_REQUEST_CLOSED,
    ActivityTypes.MERGE_REQUEST_CLOSED,
    ActivityTypes.CHANGESET_CLOSED,
    ActivityTypes.CHANGESET_ABANDONED,
  ];

  return {
    currentOpenedPRsSummaryQuery: {
      ...filter,
      activity_types: openedPRsActivities,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousOpenedPRsSummaryQuery: {
      ...filter,
      activity_types: openedPRsActivities,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },

    currentMergedPRsSummaryQuery: {
      ...filter,
      activity_types: mergedPRsActivities,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousMergedPRsSummaryQuery: {
      ...filter,
      activity_types: mergedPRsActivities,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },

    currentClosedPRsSummaryQuery: {
      ...filter,
      activity_types: closedPRsActivities,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousClosedPRsSummaryQuery: {
      ...filter,
      activity_types: closedPRsActivities,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },

    openedPRsQuery: {
      ...filter,
      activity_types: openedPRsActivities,
    },
    mergedPRsQuery: {
      ...filter,
      activity_types: mergedPRsActivities,
    },
    closedPRsQuery: {
      ...filter,
      activity_types: closedPRsActivities,
    },
    prResolutionVelocityQuery: {
      ...filter,
      activity_type: undefined,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
  };
}

export async function fetchPullRequests(filter: ActivityCountFilter): Promise<PullRequests> {
  const {
    currentOpenedPRsSummaryQuery,
    previousOpenedPRsSummaryQuery,
    currentMergedPRsSummaryQuery,
    previousMergedPRsSummaryQuery,
    currentClosedPRsSummaryQuery,
    previousClosedPRsSummaryQuery,
    openedPRsQuery,
    mergedPRsQuery,
    closedPRsQuery,
    prResolutionVelocityQuery,
  } = getTinybirdQueries(filter);

  const summariesPath = '/v0/pipes/activities_count.json';
  const dataPath = '/v0/pipes/activities_count.json';
  const prResolutionVelocityPath = '/v0/pipes/pull_requests_average_resolve_velocity.json';

  const [
    currentOpenedPRsSummary,
    previousOpenedPRsSummary,
    currentMergedPRsSummary,
    previousMergedPRsSummary,
    currentClosedPRsSummary,
    previousClosedPRsSummary,
    openedPRs,
    mergedPRs,
    closedPRs,
    prResolutionVelocity,
  ] = await Promise.all([
    fetchFromTinybird<TinybirdActivityCountSummary[]>(summariesPath, currentOpenedPRsSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(summariesPath, previousOpenedPRsSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(summariesPath, currentMergedPRsSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(summariesPath, previousMergedPRsSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(summariesPath, currentClosedPRsSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(summariesPath, previousClosedPRsSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountData[]>(dataPath, openedPRsQuery),
    fetchFromTinybird<TinybirdActivityCountData[]>(dataPath, mergedPRsQuery),
    fetchFromTinybird<TinybirdActivityCountData[]>(dataPath, closedPRsQuery),
    fetchFromTinybird<TinybirdPullRequestResolutionVelocityData[]>(
      prResolutionVelocityPath,
      prResolutionVelocityQuery,
    ),
  ]);

  const currentOpenedCount = currentOpenedPRsSummary.data[0]?.activityCount || 0;
  const previousOpenedCount = previousOpenedPRsSummary.data[0]?.activityCount || 0;
  const currentMergedCount = currentMergedPRsSummary.data[0]?.activityCount || 0;
  const previousMergedCount = previousMergedPRsSummary.data[0]?.activityCount || 0;
  const currentClosedCount = currentClosedPRsSummary.data[0]?.activityCount || 0;
  const previousClosedCount = previousClosedPRsSummary.data[0]?.activityCount || 0;
  const currentTotalCount = currentOpenedCount;
  const previousTotalCount = previousOpenedCount;
  const totalPercentageChange = calculatePercentageChange(currentTotalCount, previousTotalCount);
  const openedPercentageChange = calculatePercentageChange(currentOpenedCount, previousOpenedCount);
  const mergedPercentageChange = calculatePercentageChange(currentMergedCount, previousMergedCount);
  const closedPercentageChange = calculatePercentageChange(currentClosedCount, previousClosedCount);

  return {
    summary: {
      current: currentTotalCount,
      previous: previousTotalCount,
      percentageChange: totalPercentageChange,
      changeValue: currentTotalCount - previousTotalCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    openedSummary: {
      current: currentOpenedCount,
      previous: previousOpenedCount,
      percentageChange: openedPercentageChange,
      changeValue: currentOpenedCount - previousOpenedCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    mergedSummary: {
      current: currentMergedCount,
      previous: previousMergedCount,
      percentageChange: mergedPercentageChange,
      changeValue: currentMergedCount - previousMergedCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    closedSummary: {
      current: currentClosedCount,
      previous: previousClosedCount,
      percentageChange: closedPercentageChange,
      changeValue: currentClosedCount - previousClosedCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    avgVelocityInDays: prResolutionVelocity.data[0].averagePullRequestResolveVelocitySeconds,
    data: openedPRs.data.map((item, index) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      open: item.activityCount || 0,
      merged: mergedPRs.data[index]?.activityCount || 0,
      closed: closedPRs.data[index]?.activityCount || 0,
    })),
  };
}
