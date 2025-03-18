import type {ActivityCountFilter} from "../types";
import {ActivityFilterCountType} from "../types";
import {fetchFromTinybird} from './tinybird'
import type {StarsData} from "~~/types/popularity/responses.types";
import {calculatePercentageChange, getPreviousDates} from "~~/server/data/util";

// This is the data part of the response from Tinybird
type TinybirdActivityCountData = {
  startDate: string,
  endDate: string,
  activityCount?: number
  cumulativeActivityCount?: number
};

type TinybirdActivityCountSummary = {
  activityCount: number;
};

function getTinybirdQueries(filter: ActivityCountFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  return {
    currentSummaryQuery: {
      ...filter,
      activity_type: filter.activityType, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      repo: filter.repo, // We need this due to a discrepancy between variable names in Tinybird and the frontend
    },
    previousSummaryQuery: {
      ...filter,
      activity_type: filter.activityType, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      granularity: undefined, // This tells TinyBird to return a summary instead of time series
      repo: filter.repo, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      startDate: dates.previous.from,
      endDate: dates.previous.to
    },
    dataQuery: {
      ...filter,
      activity_type: filter.activityType, // We need this due to a discrepancy between variable names in Tinybird and the frontend
      repo: filter.repo,
    }
  }
}
export async function fetchStarsActivities(filter: ActivityCountFilter): Promise<StarsData> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const {currentSummaryQuery, previousSummaryQuery, dataQuery} = getTinybirdQueries(filter);

  const summariesPath = 'activities_count.json'; // Tinybird uses this one for the summaries
  let dataPath = 'activities_cumulative_count.json';
  if (filter.countType === ActivityFilterCountType.NEW) {
    dataPath = 'activities_count.json';
  }

  const [currentSummaryData, previousSummaryData, currentData] = await Promise.all([
    fetchFromTinybird<TinybirdActivityCountSummary[]>(`/v0/pipes/${summariesPath}`, currentSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountSummary[]>(`/v0/pipes/${summariesPath}`, previousSummaryQuery),
    fetchFromTinybird<TinybirdActivityCountData[]>(`/v0/pipes/${dataPath}`, dataQuery)
  ]);

  const currentCumulativeCount = currentSummaryData.data[0]?.activityCount || 0;
  const previousCumulativeCount = previousSummaryData.data[0]?.activityCount || 0;
  const percentageChange = calculatePercentageChange(currentCumulativeCount, previousCumulativeCount);

  let data;

  if (filter.countType === ActivityFilterCountType.CUMULATIVE) {
    data = currentData.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      stars: item.cumulativeActivityCount || 0,
    }))
  } else {
    data = currentData.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      stars: item.activityCount || 0,
    }))
  }

  return {
    summary: {
      current: currentCumulativeCount,
      previous: previousCumulativeCount,
      percentageChange,
      changeValue: currentCumulativeCount - previousCumulativeCount,
      periodFrom: filter.startDate?.toString() || '',
      periodTo: filter.endDate?.toString() || '',
    },
    data
  };
}
