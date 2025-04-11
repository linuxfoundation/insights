import type {ActiveDaysFilter} from "../types";
import {fetchFromTinybird} from './tinybird'
import {calculatePercentageChange, getPreviousDates} from "~~/server/data/util";
import type {ActiveDays} from "~~/types/development/responses.types";

// This is the data part of the response from Tinybird
type TinybirdActiveDaysSummary = {
  activeDaysCount: number,
  avgContributionsPerDay: number
};

type TinybirdActiveDaysData = {
  startDate: string,
  endDate: string,
  activityCount: number
};

function getTinybirdQueries(filter: ActiveDaysFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  return {
    currentSummaryQuery: {
      project: filter.project,
      repo: filter.repo,
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
    previousSummaryQuery: {
      project: filter.project,
      repo: filter.repo,
      startDate: dates.previous.from,
      endDate: dates.previous.to
    },
    activeDaysQuery: {
      ...filter,
    },
  }
}

export async function fetchActiveDays(filter: ActiveDaysFilter): Promise<ActiveDays> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const {
    currentSummaryQuery,
    previousSummaryQuery,
    activeDaysQuery
  } = getTinybirdQueries(filter);

  const path = '/v0/pipes/active_days.json';

  const [
    currentSummary,
    previousSummary,
    activeDaysData
  ] = await Promise.all([
    fetchFromTinybird<TinybirdActiveDaysSummary[]>(path, currentSummaryQuery),
    fetchFromTinybird<TinybirdActiveDaysSummary[]>(path, previousSummaryQuery),
    fetchFromTinybird<TinybirdActiveDaysData[]>(path, activeDaysQuery),
  ]);

  const currentCumulativeCount = currentSummary.data[0].activeDaysCount;
  const previousCumulativeCount = previousSummary.data[0].activeDaysCount;
  const percentageChange = calculatePercentageChange(currentCumulativeCount, previousCumulativeCount);
  const avgContributions = currentSummary.data[0].avgContributionsPerDay;

  return {
    summary: {
      current: currentCumulativeCount,
      previous: previousCumulativeCount,
      percentageChange,
      changeValue: currentCumulativeCount - previousCumulativeCount,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    avgContributions,
    data: activeDaysData.data.map((item, index) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      day: index + 1, // Needs to be base 1 to satisfy the frontend implementation
      contributions: item.activityCount,
    }))
  };
}
