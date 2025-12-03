// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ActivityCountFilter } from '../types';
import { fetchFromTinybird } from './tinybird';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { MedianTimeToMerge } from '~~/types/development/responses.types';

type TinybirdMedianTimeToMergeData = {
  startDate: string;
  endDate: string;
  medianTimeToMergeSeconds: number;
};

type TinybirdMedianTimeToMergeSummary = {
  medianTimeToMergeSeconds: number;
};

export async function fetchMedianTimeToMerge(
  filter: ActivityCountFilter,
): Promise<MedianTimeToMerge> {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const currentSummaryQuery = {
    ...filter,
    granularity: undefined,
  };

  const previousSummaryQuery = {
    ...filter,
    granularity: undefined,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  const dataQuery = {
    ...filter,
  };

  const summaryPath = '/v0/pipes/pull_requests_median_time_to_merge.json';
  const dataPath = '/v0/pipes/pull_requests_median_time_to_merge.json';

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdMedianTimeToMergeSummary[]>(summaryPath, currentSummaryQuery),
    fetchFromTinybird<TinybirdMedianTimeToMergeSummary[]>(summaryPath, previousSummaryQuery),
    fetchFromTinybird<TinybirdMedianTimeToMergeData[]>(dataPath, dataQuery),
  ]);

  const currentMedianTime = currentSummary.data[0]?.medianTimeToMergeSeconds || 0;
  const previousMedianTime = previousSummary.data[0]?.medianTimeToMergeSeconds || 0;
  const percentageChange = calculatePercentageChange(currentMedianTime, previousMedianTime);

  return {
    summary: {
      current: currentMedianTime,
      previous: previousMedianTime,
      percentageChange,
      changeValue: currentMedianTime - previousMedianTime,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: data.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      medianTime: item.medianTimeToMergeSeconds,
    })),
  };
}
