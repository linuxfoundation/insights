// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { PatchSetsFilter } from '../types';
import { fetchFromTinybird } from '../tinybird';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { PatchsetsPerReview } from '~~/types/development/responses.types';

type TinybirdPatchsetsPerReviewData = {
  startDate: string;
  endDate: string;
  patchsetsPerReview: number;
};

type TinybirdPatchsetsPerReviewSummary = {
  patchsetsPerReview: number;
};

export async function fetchPatchsetsPerReview(
  filter: PatchSetsFilter,
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

  const summaryPath = '/v0/pipes/patchsets_per_review.json';
  const dataPath = '/v0/pipes/patchsets_per_review.json';

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdPatchsetsPerReviewSummary[]>(summaryPath, currentSummaryQuery),
    fetchFromTinybird<TinybirdPatchsetsPerReviewSummary[]>(summaryPath, previousSummaryQuery),
    fetchFromTinybird<TinybirdPatchsetsPerReviewData[]>(dataPath, dataQuery),
  ]);

  const currentValue = currentSummary.data[0]?.patchsetsPerReview || 0;
  const previousValue = previousSummary.data[0]?.patchsetsPerReview || 0;
  const percentageChange = calculatePercentageChange(currentValue, previousValue);

  return {
    summary: {
      current: currentValue,
      previous: previousValue,
      percentageChange,
      changeValue: currentValue - previousValue,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: data.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      median: item.patchsetsPerReview,
      average: item.patchsetsPerReview,
    })),
  };
}
