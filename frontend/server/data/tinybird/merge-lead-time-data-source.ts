import type { WaitTimeFor1stReviewFilter } from "../types";
import { fetchFromTinybird } from './tinybird'
import { calculatePercentageChange, getPreviousDates } from "~~/server/data/util";
import type { MergeLeadTime } from "~~/types/development/responses.types";

// This is the data part of the response from Tinybird
type TinybirdMergeLeadTimeData = {
  openedToMergedSeconds: number,
  openedToReviewAssignedSeconds: number,
  reviewAssignedToFirstReviewSeconds: number,
  firstReviewToApprovedSeconds: number,
  approvedToMergedSeconds: number
};

export async function fetchMergeLeadTime(filter: WaitTimeFor1stReviewFilter): Promise<MergeLeadTime> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const previousSummaryQuery = {
    ...filter,
    startDate: dates.previous.from,
    endDate: dates.previous.to
  };

  const path = '/v0/pipes/pull_requests_merge_lead_time.json';

  const [currentData, previousData] = await Promise.all([
    fetchFromTinybird<TinybirdMergeLeadTimeData[]>(path, filter),
    fetchFromTinybird<TinybirdMergeLeadTimeData[]>(path, previousSummaryQuery),
  ]);

  const currentValue = currentData.data[0].openedToMergedSeconds;
  const previousValue = previousData.data[0].openedToMergedSeconds;
  const currentToReviewAssigned = currentData.data[0].openedToReviewAssignedSeconds;
  const previousToReviewAssigned = previousData.data[0].openedToReviewAssignedSeconds;
  const currentToFirstReview = currentData.data[0].reviewAssignedToFirstReviewSeconds;
  const previousToFirstReview = previousData.data[0].reviewAssignedToFirstReviewSeconds;
  const currentToApproved = currentData.data[0].firstReviewToApprovedSeconds;
  const previousToApproved = previousData.data[0].firstReviewToApprovedSeconds;
  const currentToMerged = currentData.data[0].approvedToMergedSeconds;
  const previousToMerged = previousData.data[0].approvedToMergedSeconds;

  return {
    summary: {
      current: currentValue,
      previous: previousValue,
      percentageChange: calculatePercentageChange(currentValue, previousValue),
      changeValue: currentValue - previousValue,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: {
      pickup: {
        value: currentToReviewAssigned,
        unit: 'seconds',
        changeType: currentToReviewAssigned > previousToReviewAssigned ? 'positive' : 'negative'
      },
      review: {
        value: currentToFirstReview,
        unit: 'seconds',
        changeType: currentToFirstReview > previousToFirstReview ? 'positive' : 'negative'
      },
      accepted: {
        value: currentData.data[0].firstReviewToApprovedSeconds,
        unit: 'seconds',
        changeType: currentToApproved > previousToApproved ? 'positive' : 'negative'
      },
      prMerged: {
        value: currentData.data[0].approvedToMergedSeconds,
        unit: 'seconds',
        changeType: currentToMerged > previousToMerged ? 'positive' : 'negative'
      }
    }
  };
}
