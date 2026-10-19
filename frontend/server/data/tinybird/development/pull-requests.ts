// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { PullRequests } from '~~/types/development/responses.types';

import type { ActivityCountFilter } from '../../types';
import { fetchFromTinybird } from '../tinybird';

// This is the data part of the response from Tinybird
type TinybirdPullRequestCountData = {
  startDate: string;
  endDate: string;
  pullRequestCount?: number;
};

type TinybirdPullRequestCountSummary = {
  pullRequestCount: number;
};

type TinybirdPullRequestResolutionVelocityData = {
  averagePullRequestResolveVelocitySeconds: number;
};

// The lifecycle timestamp pull_requests_count counts by. It counts each pull request once, from the
// PR lifecycle data, so a merge done by a bot account still counts as merged.
type PullRequestState = 'opened' | 'merged' | 'closed';

function getTinybirdQueries(filter: ActivityCountFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const opened: PullRequestState = 'opened';
  const merged: PullRequestState = 'merged';
  const closed: PullRequestState = 'closed';

  return {
    currentOpenedPRsSummaryQuery: {
      ...filter,
      state: opened,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousOpenedPRsSummaryQuery: {
      ...filter,
      state: opened,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },

    currentMergedPRsSummaryQuery: {
      ...filter,
      state: merged,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousMergedPRsSummaryQuery: {
      ...filter,
      state: merged,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },

    currentClosedPRsSummaryQuery: {
      ...filter,
      state: closed,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousClosedPRsSummaryQuery: {
      ...filter,
      state: closed,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },

    openedPRsQuery: {
      ...filter,
      state: opened,
    },
    mergedPRsQuery: {
      ...filter,
      state: merged,
    },
    closedPRsQuery: {
      ...filter,
      state: closed,
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

  const summariesPath = '/v0/pipes/pull_requests_count.json';
  const dataPath = '/v0/pipes/pull_requests_count.json';
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
    fetchFromTinybird<TinybirdPullRequestCountSummary[]>(
      summariesPath,
      currentOpenedPRsSummaryQuery,
    ),
    fetchFromTinybird<TinybirdPullRequestCountSummary[]>(
      summariesPath,
      previousOpenedPRsSummaryQuery,
    ),
    fetchFromTinybird<TinybirdPullRequestCountSummary[]>(
      summariesPath,
      currentMergedPRsSummaryQuery,
    ),
    fetchFromTinybird<TinybirdPullRequestCountSummary[]>(
      summariesPath,
      previousMergedPRsSummaryQuery,
    ),
    fetchFromTinybird<TinybirdPullRequestCountSummary[]>(
      summariesPath,
      currentClosedPRsSummaryQuery,
    ),
    fetchFromTinybird<TinybirdPullRequestCountSummary[]>(
      summariesPath,
      previousClosedPRsSummaryQuery,
    ),
    fetchFromTinybird<TinybirdPullRequestCountData[]>(dataPath, openedPRsQuery),
    fetchFromTinybird<TinybirdPullRequestCountData[]>(dataPath, mergedPRsQuery),
    fetchFromTinybird<TinybirdPullRequestCountData[]>(dataPath, closedPRsQuery),
    fetchFromTinybird<TinybirdPullRequestResolutionVelocityData[]>(
      prResolutionVelocityPath,
      prResolutionVelocityQuery,
    ),
  ]);

  const currentOpenedCount = currentOpenedPRsSummary.data[0]?.pullRequestCount || 0;
  const previousOpenedCount = previousOpenedPRsSummary.data[0]?.pullRequestCount || 0;
  const currentMergedCount = currentMergedPRsSummary.data[0]?.pullRequestCount || 0;
  const previousMergedCount = previousMergedPRsSummary.data[0]?.pullRequestCount || 0;
  const currentClosedCount = currentClosedPRsSummary.data[0]?.pullRequestCount || 0;
  const previousClosedCount = previousClosedPRsSummary.data[0]?.pullRequestCount || 0;
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
    // Guard the [0] access (see issues-resolution): empty data / null avg degrades to null,
    // rendered as "-", instead of throwing and dropping the whole widget response.
    avgVelocityInDays:
      prResolutionVelocity.data[0]?.averagePullRequestResolveVelocitySeconds ?? null,
    data: openedPRs.data.map((item, index) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      open: item.pullRequestCount || 0,
      merged: mergedPRs.data[index]?.pullRequestCount || 0,
      closed: closedPRs.data[index]?.pullRequestCount || 0,
    })),
  };
}
