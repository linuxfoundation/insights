// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { MergeLeadTimeFilter } from '../../types';
import { fetchFromTinybird } from '../tinybird';
import { calculatePercentageChange, getPreviousDates } from '~~/server/data/util';
import type { MergeLeadTime } from '~~/types/development/responses.types';

// This is the data part of the response from Tinybird
type TinybirdMergeLeadTimeData = {
  openedToMergedSeconds: number;
  openedToReviewAssignedSeconds: number;
  reviewAssignedToFirstReviewSeconds: number;
  firstReviewToApprovedSeconds: number;
  approvedToMergedSeconds: number;
};

export async function fetchMergeLeadTime(filter: MergeLeadTimeFilter): Promise<MergeLeadTime> {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const previousSummaryQuery = {
    ...filter,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  const path = '/v0/pipes/pull_requests_merge_lead_time.json';

  const [currentData, previousData] = await Promise.all([
    fetchFromTinybird<TinybirdMergeLeadTimeData[]>(path, filter),
    fetchFromTinybird<TinybirdMergeLeadTimeData[]>(path, previousSummaryQuery),
  ]);

  // Tinybird returns an empty data array when there are no merged PRs in scope (common for
  // collection-scoped or low-activity requests). Guard the [0] access so each stage degrades to
  // null instead of throwing on undefined[0] and dropping the whole widget response.
  const current = currentData.data[0];
  const previous = previousData.data[0];

  const currentValue = current?.openedToMergedSeconds ?? null;
  const previousValue = previous?.openedToMergedSeconds ?? null;
  const currentToReviewAssigned = current?.openedToReviewAssignedSeconds ?? null;
  const previousToReviewAssigned = previous?.openedToReviewAssignedSeconds ?? null;
  const currentToFirstReview = current?.reviewAssignedToFirstReviewSeconds ?? null;
  const previousToFirstReview = previous?.reviewAssignedToFirstReviewSeconds ?? null;
  const currentToApproved = current?.firstReviewToApprovedSeconds ?? null;
  const previousToApproved = previous?.firstReviewToApprovedSeconds ?? null;
  const currentToMerged = current?.approvedToMergedSeconds ?? null;
  const previousToMerged = previous?.approvedToMergedSeconds ?? null;

  // Only meaningful when both periods have data; comparing against a null (no-data) period would
  // be misleading, so treat those as neutral.
  const changeType = (curr: number | null, prev: number | null): 'positive' | 'negative' =>
    curr !== null && prev !== null && curr > prev ? 'positive' : 'negative';

  return {
    summary: {
      current: currentValue,
      previous: previousValue,
      percentageChange:
        currentValue !== null && previousValue !== null
          ? calculatePercentageChange(currentValue, previousValue)
          : 0,
      changeValue:
        currentValue !== null && previousValue !== null ? currentValue - previousValue : 0,
      periodFrom: filter.startDate?.toISO() || '',
      periodTo: filter.endDate?.toISO() || '',
    },
    data: {
      pickup: {
        value: currentToReviewAssigned,
        unit: 'seconds',
        changeType: changeType(currentToReviewAssigned, previousToReviewAssigned),
      },
      review: {
        value: currentToFirstReview,
        unit: 'seconds',
        changeType: changeType(currentToFirstReview, previousToFirstReview),
      },
      accepted: {
        value: currentToApproved,
        unit: 'seconds',
        changeType: changeType(currentToApproved, previousToApproved),
      },
      prMerged: {
        value: currentToMerged,
        unit: 'seconds',
        changeType: changeType(currentToMerged, previousToMerged),
      },
    },
  };
}
