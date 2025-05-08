// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ActivityCountFilter } from "../types";
import { fetchFromTinybird } from './tinybird'
import {ActivityTypes} from "~~/types/shared/activity-types";
import { calculatePercentageChange, getPreviousDates } from "~~/server/data/util";
import type { PullRequests } from "~~/types/development/responses.types";

// This is the data part of the response from Tinybird
type TinybirdActivityCountData = {
  startDate: string,
  endDate: string,
  activityCount?: number
  cumulativeActivityCount?: number
};

type TinybirdActivityCountSummary = {
  activityCount: number;
};

type TinybirdPullRequestResolutionVelocityData = {
  averagePullRequestResolveVelocitySeconds: number;
};

function getTinybirdQueries(filter: ActivityCountFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  return {
    currentOpenedPRsSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_OPENED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousOpenedPRsSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_OPENED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to
    },

    currentMergedPRsSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_MERGED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousMergedPRsSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_MERGED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to
    },

    currentClosedPRsSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_CLOSED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousClosedPRsSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_CLOSED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to
    },

    openedPRsQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_OPENED,
    },
    mergedPRsQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_MERGED,
    },
    closedPRsQuery: {
      ...filter,
      activity_type: ActivityTypes.PULL_REQUEST_CLOSED,
    },
    prResolutionVelocityQuery: {
      ...filter,
      activity_type: undefined,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    }
  }
}

export async function fetchPullRequests(filter: ActivityCountFilter): Promise<PullRequests> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

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
    prResolutionVelocityQuery
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
    prResolutionVelocity
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
    fetchFromTinybird<TinybirdPullRequestResolutionVelocityData[]>(prResolutionVelocityPath, prResolutionVelocityQuery)
  ]);

  const currentOpenedCount = currentOpenedPRsSummary.data[0]?.activityCount || 0;
  const previousOpenedCount = previousOpenedPRsSummary.data[0]?.activityCount || 0;
  const currentMergedCount = currentMergedPRsSummary.data[0]?.activityCount || 0;
  const previousMergedCount = previousMergedPRsSummary.data[0]?.activityCount || 0;
  const currentClosedCount = currentClosedPRsSummary.data[0]?.activityCount || 0;
  const previousClosedCount = previousClosedPRsSummary.data[0]?.activityCount || 0;
  const currentTotalCount = currentOpenedCount + currentMergedCount + currentClosedCount;
  const previousTotalCount = previousOpenedCount + previousMergedCount + previousClosedCount;
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
    }))
  };
}
