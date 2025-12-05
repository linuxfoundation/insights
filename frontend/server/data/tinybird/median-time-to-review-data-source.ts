// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { MedianTimeToReviewFilter } from '../types';
import { fetchFromTinybird } from './tinybird';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { MedianTimeToReview } from '~~/types/development/responses.types';

type TinybirdMedianTimeToReviewData = {
  startDate: string;
  endDate: string;
  medianTimeToReviewSeconds: number;
};

type TinybirdMedianTimeToReviewSummary = {
  medianTimeToReviewSeconds: number;
};

export async function fetchMedianTimeToReview(
  filter: MedianTimeToReviewFilter,
): Promise<MedianTimeToReview> {
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

  const summaryPath = '/v0/pipes/median_time_to_review.json';
  const dataPath = '/v0/pipes/median_time_to_review.json';

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdMedianTimeToReviewSummary[]>(summaryPath, currentSummaryQuery),
    fetchFromTinybird<TinybirdMedianTimeToReviewSummary[]>(summaryPath, previousSummaryQuery),
    fetchFromTinybird<TinybirdMedianTimeToReviewData[]>(dataPath, dataQuery),
  ]);

  const currentMedianTime = currentSummary.data[0]?.medianTimeToReviewSeconds || 0;
  const previousMedianTime = previousSummary.data[0]?.medianTimeToReviewSeconds || 0;
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
      medianTime: item.medianTimeToReviewSeconds,
    })),
  };
}
