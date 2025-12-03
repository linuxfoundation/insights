// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ActivityCountFilter } from '../types';
import { fetchFromTinybird } from './tinybird';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { ReviewEfficiency } from '~~/types/development/responses.types';

type TinybirdReviewEfficiencyData = {
  startDate: string;
  endDate: string;
  openedPullRequests: number;
  mergedAndClosedPullRequests: number;
};

type TinybirdReviewEfficiencySummary = {
  openedPullRequests: number;
  mergedAndClosedPullRequests: number;
  reviewEfficiency: number;
};

export async function fetchReviewEfficiency(
  filter: ActivityCountFilter,
): Promise<ReviewEfficiency> {
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

  const summaryPath = '/v0/pipes/pull_requests_review_efficiency.json';
  const dataPath = '/v0/pipes/pull_requests_review_efficiency.json';

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdReviewEfficiencySummary[]>(summaryPath, currentSummaryQuery),
    fetchFromTinybird<TinybirdReviewEfficiencySummary[]>(summaryPath, previousSummaryQuery),
    fetchFromTinybird<TinybirdReviewEfficiencyData[]>(dataPath, dataQuery),
  ]);

  const currentEfficiency = currentSummary.data[0]?.reviewEfficiency || 0;
  const previousEfficiency = previousSummary.data[0]?.reviewEfficiency || 0;
  const currentOpened = currentSummary.data[0]?.openedPullRequests || 0;
  const previousOpened = previousSummary.data[0]?.openedPullRequests || 0;
  const currentClosed = currentSummary.data[0]?.mergedAndClosedPullRequests || 0;
  const previousClosed = previousSummary.data[0]?.mergedAndClosedPullRequests || 0;

  const efficiencyPercentageChange = calculatePercentageChange(
    currentEfficiency,
    previousEfficiency,
  );
  const openedPercentageChange = calculatePercentageChange(currentOpened, previousOpened);
  const closedPercentageChange = calculatePercentageChange(currentClosed, previousClosed);

  return {
    summary: {
      current: currentEfficiency,
      previous: previousEfficiency,
      percentageChange: efficiencyPercentageChange,
      changeValue: currentEfficiency - previousEfficiency,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    openedSummary: {
      current: currentOpened,
      previous: previousOpened,
      percentageChange: openedPercentageChange,
      changeValue: currentOpened - previousOpened,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    closedSummary: {
      current: currentClosed,
      previous: previousClosed,
      percentageChange: closedPercentageChange,
      changeValue: currentClosed - previousClosed,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: data.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      opened: item.openedPullRequests,
      closed: item.mergedAndClosedPullRequests,
    })),
  };
}
