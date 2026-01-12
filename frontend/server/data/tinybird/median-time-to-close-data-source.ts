// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { MedianTimeToCloseFilter } from '../types';
import { fetchFromTinybird } from './tinybird';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { MedianTimeToClose } from '~~/types/development/responses.types';

type TinybirdMedianTimeToCloseData = {
  startDate: string;
  endDate: string;
  medianTimeToCloseSeconds: number;
};

type TinybirdMedianTimeToCloseSummary = {
  medianTimeToCloseSeconds: number;
};

export async function fetchMedianTimeToClose(
  filter: MedianTimeToCloseFilter,
): Promise<MedianTimeToClose> {
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

  const summaryPath = '/v0/pipes/median_time_to_close.json';
  const dataPath = '/v0/pipes/median_time_to_close.json';

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdMedianTimeToCloseSummary[]>(summaryPath, currentSummaryQuery),
    fetchFromTinybird<TinybirdMedianTimeToCloseSummary[]>(summaryPath, previousSummaryQuery),
    fetchFromTinybird<TinybirdMedianTimeToCloseData[]>(dataPath, dataQuery),
  ]);

  const currentMedianTime = currentSummary.data[0]?.medianTimeToCloseSeconds || 0;
  const previousMedianTime = previousSummary.data[0]?.medianTimeToCloseSeconds || 0;
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
      medianTime: item.medianTimeToCloseSeconds,
    })),
  };
}
