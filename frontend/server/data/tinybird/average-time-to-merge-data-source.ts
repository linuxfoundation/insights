// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { AverageTimeToMergeFilter } from "../types";
import { fetchFromTinybird } from './tinybird'
import { calculatePercentageChange, getPreviousDates } from "~~/server/data/util";
import type { AverageTimeMerge } from "~~/types/development/responses.types";

// This is the data part of the response from Tinybird
type TinybirdAverageTimeToMergeData = {
  startDate: string,
  endDate: string,
  averageTimeToMergeSeconds: number
};

type TinybirdAverageTimeToMergeSummary = {
  averageTimeToMergeSeconds: number;
};

export async function fetchAverageTimeToMerge(filter: AverageTimeToMergeFilter): Promise<AverageTimeMerge> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const dates = getPreviousDates(filter.startDate, filter.endDate);
  const currentSummaryQuery = {
    ...filter,
    granularity: undefined, // This tells TinyBird to return a summary instead of time series
  };
  const previousSummaryQuery = {
    ...filter,
    granularity: undefined, // This tells TinyBird to return a summary instead of time series
    startDate: dates.previous.from,
    endDate: dates.previous.to
  };

  const path = '/v0/pipes/pull_requests_average_time_to_merge.json';

  const [
    currentSummary,
    previousSummary,
    averageTimeToMergeData
  ] = await Promise.all([
    fetchFromTinybird<TinybirdAverageTimeToMergeSummary[]>(path, currentSummaryQuery),
    fetchFromTinybird<TinybirdAverageTimeToMergeSummary[]>(path, previousSummaryQuery),
    fetchFromTinybird<TinybirdAverageTimeToMergeData[]>(path, filter),
  ]);

  const currentAverageTime = currentSummary.data[0]?.averageTimeToMergeSeconds || 0;
  const previousAverageTime = previousSummary.data[0]?.averageTimeToMergeSeconds || 0;
  const changeValue = currentAverageTime - previousAverageTime;
  const percentageChange = calculatePercentageChange(currentAverageTime, previousAverageTime);

  return {
    summary: {
      current: currentAverageTime,
      previous: previousAverageTime,
      percentageChange,
      changeValue,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: averageTimeToMergeData.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      averageTime: item.averageTimeToMergeSeconds
    }))
  };
}
