// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from './tinybird'
import {calculatePercentageChange, getPreviousDates} from "~~/server/data/util";
import type {ContributionOutsideHours} from "~~/types/development/responses.types";
import type {ContributionsOutsideWorkHoursFilter} from "~~/types/development/requests.types";
import type {TinybirdActivityHeatmapData} from "~~/server/data/tinybird/responses.types";
import type {ActivityHeatmapByWeekdayTBQuery} from "~~/server/data/tinybird/requests.types";

export async function fetchContributionsOutsideWorkHours(
  filter: ContributionsOutsideWorkHoursFilter
): Promise<ContributionOutsideHours> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const dates = getPreviousDates(filter.startDate, filter.endDate);
  const currentSummaryQuery: ActivityHeatmapByWeekdayTBQuery = {
    ...filter,
  };
  const previousSummaryQuery: ActivityHeatmapByWeekdayTBQuery = {
    ...filter,
    startDate: dates.previous.from,
    endDate: dates.previous.to
  };

  const path = '/v0/pipes/activity_heatmap_by_weekday_and_2hours_blocks.json';

  const [
    currentData,
    previousData,
  ] = await Promise.all([
    fetchFromTinybird<TinybirdActivityHeatmapData[]>(path, currentSummaryQuery),
    fetchFromTinybird<TinybirdActivityHeatmapData[]>(path, previousSummaryQuery),
  ]);

  const currentTotalCount = sum(currentData.data);
  const previousTotalCount = sum(previousData.data);

  // Contributions outside work hours are defined as contributions made on weekdays (Monday to Friday)
  // between 6 PM and 8 AM, or on weekends (Saturday and Sunday) at any time.

  const currentWeekOutside = sum(filterWeekdaysOutsideWorkHours(currentData.data));
  const currentWeekend = sum(filterWeekends(currentData.data));
  const currentOutsideTotal = currentWeekOutside + currentWeekend;
  const currentPercentage = calculatePercentage(currentTotalCount, currentOutsideTotal) || 0;

  const previousWeekOutside = sum(filterWeekdaysOutsideWorkHours(previousData.data));
  const previousWeekend = sum(filterWeekends(previousData.data));
  const previousOutsideTotal = previousWeekOutside + previousWeekend;
  const previousPercentage = calculatePercentage(previousTotalCount, previousOutsideTotal) || 0;

  // const percentageChange = calculatePercentageChange(currentOutsideTotal, previousOutsideTotal) || 0;
  const percentageChange = calculatePercentageChange(currentPercentage, previousPercentage) || 0;

  const weekdayPercentage = calculatePercentage(currentTotalCount, currentWeekOutside) || 0;
  const weekendPercentage = calculatePercentage(currentTotalCount, currentWeekend) || 0;

  return {
    summary: {
      current: currentPercentage,
      previous: previousPercentage,
      percentageChange,
      changeValue: currentPercentage - previousPercentage,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    weekdayOutsideHoursPercentage: weekdayPercentage,
    weekendOutsideHoursPercentage: weekendPercentage,
    data: currentData.data.map((item) => ({
      day: item.weekday - 1, // We have to subtract 1 because the frontend uses a 0-indexed approach.
      hour: item.twoHoursBlock,
      contributions: item.activityCount,
    }))
  };
}

function sum(data: TinybirdActivityHeatmapData[]): number {
  return data.reduce((acc, item) => acc + item.activityCount, 0);
}

function filterWeekdaysOutsideWorkHours(data: TinybirdActivityHeatmapData[]): TinybirdActivityHeatmapData[] {
  return data.filter((item) => item.weekday <= 5 && (item.twoHoursBlock >= 18 || item.twoHoursBlock < 8));
}

function filterWeekends(data: TinybirdActivityHeatmapData[]): TinybirdActivityHeatmapData[] {
  return data.filter((item) => item.weekday >= 6);
}

function calculatePercentage(total: number, partial: number): number | undefined {
  if (total === 0) {
    return partial === 0 ? 0 : undefined; // Avoid division by zero.  Return 0 if both are 0, undefined otherwise
  }
  return (partial / total) * 100;
}
