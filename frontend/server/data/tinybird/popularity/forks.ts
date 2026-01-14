// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ActivityCountFilter } from '../../types';
import { ActivityFilterCountType } from '../../types';
import { fetchFromTinybird } from '../tinybird';
import type { ForksData } from '~~/types/popularity/responses.types';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';

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

function getTinybirdQueries(filter: ActivityCountFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  return {
    currentSummaryQuery: {
      ...filter,
      activity_type: filter.activity_type, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      repos: filter.repos, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      includeOtherContributions: true,
    },
    previousSummaryQuery: {
      ...filter,
      activity_type: filter.activity_type, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      repos: filter.repos, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      startDate: dates.previous.from,
      endDate: dates.previous.to,
      includeOtherContributions: true,
    },
    dataQuery: {
      ...filter,
      activity_type: filter.activity_type, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      repos: filter.repos,
      includeOtherContributions: true,
    },
  };
}
export async function fetchForksActivities(filter: ActivityCountFilter): Promise<ForksData> {
  const { currentSummaryQuery, previousSummaryQuery, dataQuery } = getTinybirdQueries(filter);

  const summariesPath = 'activities_count.json'; // Tinybird uses this one for the summaries
  let dataPath = 'activities_cumulative_count.json';
  if (filter.countType === ActivityFilterCountType.NEW) {
    dataPath = 'activities_count.json';
  }

  const [currentSummaryData, previousSummaryData, currentData] = await Promise.all([
    fetchFromTinybird<TinybirdActivityCountSummary[]>(
      `/v0/pipes/${summariesPath}`,
      currentSummaryQuery,
    ),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(
      `/v0/pipes/${summariesPath}`,
      previousSummaryQuery,
    ),
    fetchFromTinybird<TinybirdActivityCountData[]>(`/v0/pipes/${dataPath}`, dataQuery),
  ]);

  const currentCumulativeCount = currentSummaryData.data[0]?.activityCount || 0;
  const previousCumulativeCount = previousSummaryData.data[0]?.activityCount || 0;
  const percentageChange = calculatePercentageChange(
    currentCumulativeCount,
    previousCumulativeCount,
  );

  let data;

  if (filter.countType === ActivityFilterCountType.CUMULATIVE) {
    data = currentData.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      forks: item.cumulativeActivityCount || 0,
    }));
  } else {
    data = currentData.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      forks: item.activityCount || 0,
    }));
  }

  return {
    summary: {
      current: currentCumulativeCount,
      previous: previousCumulativeCount,
      percentageChange,
      changeValue: currentCumulativeCount - previousCumulativeCount,
      periodFrom: filter.startDate?.toString() || '',
      periodTo: filter.endDate?.toString() || '',
    },
    data,
  };
}
