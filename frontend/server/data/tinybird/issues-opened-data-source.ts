// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ActivityCountFilter } from "../types";
import { fetchFromTinybird } from "./tinybird";
import { ActivityTypes } from "~~/types/shared/activity-types";
import {
  calculatePercentageChange,
  getPreviousDates,
} from "~~/server/data/util";
import type {
  IssuesOpened,
  IssuesOpenedData,
} from "~~/types/development/responses.types";

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
      activity_type: ActivityTypes.ISSUES_OPENED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.ISSUES_OPENED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },
    issuesOpenedQuery: {
      ...filter,
      activity_type: ActivityTypes.ISSUES_OPENED,
    },
  };
}

export async function fetchIssuesOpened(
  filter: ActivityCountFilter
): Promise<IssuesOpened> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const {
    currentSummaryQuery,
    previousSummaryQuery,
    issuesOpenedQuery,
  } = getTinybirdQueries(filter);

  const summariesPath = "/v0/pipes/activities_count.json";
  const dataPath = "/v0/pipes/activities_count.json";

  const [
    currentSummaryData,
    previousSummaryData,
    issuesOpened,
  ] = await Promise.all([
    fetchFromTinybird<TinybirdActivityCountSummary[]>(
      summariesPath,
      currentSummaryQuery
    ),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(
      summariesPath,
      previousSummaryQuery
    ),
    fetchFromTinybird<TinybirdActivityCountData[]>(dataPath, issuesOpenedQuery),
  ]);

  const currentCumulativeCount = currentSummaryData.data[0]?.activityCount || 0;
  const previousCumulativeCount = previousSummaryData.data[0]?.activityCount || 0;
  const percentageChange = calculatePercentageChange(
    currentCumulativeCount,
    previousCumulativeCount
  );

  return {
    summary: {
      current: currentCumulativeCount,
      previous: previousCumulativeCount,
      percentageChange,
      changeValue: currentCumulativeCount - previousCumulativeCount,
      periodFrom: filter.startDate?.toISO() || "",
      periodTo: filter.endDate?.toISO() || "",
    },
    data: formatIssuesOpenedData(issuesOpened.data),
  };
}

export function formatIssuesOpenedData(
  data: TinybirdActivityCountData[]
): IssuesOpenedData[] {
  return data
    .map((item) => ({
      dateFrom: item.startDate,
      dateTo: item.endDate,
      openedIssues: item.activityCount ?? 0,
    }))
    .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
} 