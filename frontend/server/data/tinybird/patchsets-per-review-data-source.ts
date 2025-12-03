// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ActivityCountFilter } from '../types';
import { fetchFromTinybird } from './tinybird';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { PatchsetsPerReview } from '~~/types/development/responses.types';

type TinybirdPatchsetsPerReviewData = {
  startDate: string;
  endDate: string;
  medianPatchsetsPerReview: number;
  averagePatchsetsPerReview: number;
};

type TinybirdPatchsetsPerReviewSummary = {
  medianPatchsetsPerReview: number;
  averagePatchsetsPerReview: number;
};

export async function fetchPatchsetsPerReview(
  filter: ActivityCountFilter,
): Promise<PatchsetsPerReview> {
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

  const summaryPath = '/v0/pipes/pull_requests_patchsets_per_review.json';
  const dataPath = '/v0/pipes/pull_requests_patchsets_per_review.json';

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdPatchsetsPerReviewSummary[]>(summaryPath, currentSummaryQuery),
    fetchFromTinybird<TinybirdPatchsetsPerReviewSummary[]>(summaryPath, previousSummaryQuery),
    fetchFromTinybird<TinybirdPatchsetsPerReviewData[]>(dataPath, dataQuery),
  ]);

  const currentMedian = currentSummary.data[0]?.medianPatchsetsPerReview || 0;
  const previousMedian = previousSummary.data[0]?.medianPatchsetsPerReview || 0;
  const percentageChange = calculatePercentageChange(currentMedian, previousMedian);

  return {
    summary: {
      current: currentMedian,
      previous: previousMedian,
      percentageChange,
      changeValue: currentMedian - previousMedian,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: data.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      median: item.medianPatchsetsPerReview,
      average: item.averagePatchsetsPerReview,
    })),
  };
}
