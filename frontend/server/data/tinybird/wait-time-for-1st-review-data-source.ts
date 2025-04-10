import type { WaitTimeFor1stReviewFilter } from "../types";
import { fetchFromTinybird } from './tinybird'
import { calculatePercentageChange, getPreviousDates } from "~~/server/data/util";
import type { WaitTime1stReview } from "~~/types/development/responses.types";

// This is the data part of the response from Tinybird
type TinybirdWaitTimeFor1stReviewData = {
  startDate: string,
  endDate: string,
  averageTimeToFirstReviewSeconds: number
};

type TinybirdWaitTimeFor1stReviewSummary = {
  averageTimeToFirstReviewSeconds: number;
};

export async function fetchWaitTimeFor1stReview(filter: WaitTimeFor1stReviewFilter): Promise<WaitTime1stReview> {
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

  const path = '/v0/pipes/pull_requests_average_time_to_first_review.json';

  const [
    currentSummary,
    previousSummary,
    waitTimeTo1stReviewData
  ] = await Promise.all([
    fetchFromTinybird<TinybirdWaitTimeFor1stReviewSummary[]>(path, currentSummaryQuery),
    fetchFromTinybird<TinybirdWaitTimeFor1stReviewSummary[]>(path, previousSummaryQuery),
    fetchFromTinybird<TinybirdWaitTimeFor1stReviewData[]>(path, filter),
  ]);

  const currentAverageTime = currentSummary.data[0]?.averageTimeToFirstReviewSeconds || 0;
  const previousAverageTime = previousSummary.data[0]?.averageTimeToFirstReviewSeconds || 0;
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
    data: waitTimeTo1stReviewData.data.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      waitTime: item.averageTimeToFirstReviewSeconds
    }))
  };
}
