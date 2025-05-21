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
  IssuesResolution,
  IssuesResolutionData,
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

type TinybirdIssueResolutionVelocityData = {
  averageIssueResolveVelocitySeconds: number;
};

function getTinybirdQueries(filter: ActivityCountFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  return {
    currentSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.ISSUES_CLOSED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
    previousSummaryQuery: {
      ...filter,
      activity_type: ActivityTypes.ISSUES_CLOSED,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      startDate: dates.previous.from,
      endDate: dates.previous.to,
    },
    issuesOpenedQuery: {
      ...filter,
      activity_type: ActivityTypes.ISSUES_OPENED,
    },
    issuesClosedQuery: {
      ...filter,
      activity_type: ActivityTypes.ISSUES_CLOSED,
    },
    issueResolutionVelocityQuery: {
      ...filter,
      activity_type: undefined,
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
    },
  };
}

export async function fetchIssuesResolution(
  filter: ActivityCountFilter
): Promise<IssuesResolution> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const {
    currentSummaryQuery,
    previousSummaryQuery,
    issuesOpenedQuery,
    issuesClosedQuery,
    issueResolutionVelocityQuery,
  } = getTinybirdQueries(filter);

  const summariesPath = "/v0/pipes/activities_count.json";
  const dataPath = "/v0/pipes/activities_count.json";
  const issueResolutionVelocityPath = "/v0/pipes/issues_average_resolve_velocity.json";

  const [
    currentSummaryData,
    previousSummaryData,
    issuesOpened,
    issuesClosed,
    issueResolutionVelocity,
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
    fetchFromTinybird<TinybirdActivityCountData[]>(dataPath, issuesClosedQuery),
    fetchFromTinybird<TinybirdIssueResolutionVelocityData[]>(
      issueResolutionVelocityPath,
      issueResolutionVelocityQuery
    ),
  ]);

  const currentCumulativeCount = currentSummaryData.data[0]?.activityCount || 0;
  const previousCumulativeCount = previousSummaryData.data[0]?.activityCount || 0;
  const percentageChange = calculatePercentageChange(
    currentCumulativeCount,
    previousCumulativeCount
  );

  // join the data from issuesOpened and issuesClosed together
  return {
    summary: {
      current: currentCumulativeCount,
      previous: previousCumulativeCount,
      percentageChange,
      changeValue: currentCumulativeCount - previousCumulativeCount,
      periodFrom: filter.startDate?.toISO() || "",
      periodTo: filter.endDate?.toISO() || "",
      avgVelocityInDays:
        issueResolutionVelocity.data[0].averageIssueResolveVelocitySeconds,
    },
    data: mergeRanges(issuesOpened.data, issuesClosed.data),
  };
}

export function mergeRanges(
  array1: TinybirdActivityCountData[],
  array2: TinybirdActivityCountData[]
): IssuesResolutionData[] {
  const getKey = (r: TinybirdActivityCountData) => `${r.startDate}_${r.endDate}`;

  const map1 = new Map(array1.map((r) => [getKey(r), r]));
  const map2 = new Map(array2.map((r) => [getKey(r), r]));

  const allKeys = Array.from(new Set([...array1, ...array2].map(getKey)));

  return allKeys
    .map((key) => {
      const [startDate, endDate] = key.split("_");
      const r1 = map1.get(key);
      const r2 = map2.get(key);

      return {
        dateFrom: startDate,
        dateTo: endDate,
        totalIssues: r1?.activityCount ?? 0,
        closedIssues: r2?.activityCount ?? 0,
      };
    })
    .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
}
