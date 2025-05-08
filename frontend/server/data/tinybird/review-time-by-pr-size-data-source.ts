// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {ReviewTimeByPRSizeFilter} from "../types";
import { fetchFromTinybird } from './tinybird'
import type { ReviewTimeByPrItem } from "~~/types/development/responses.types";

// This is the data part of the response from Tinybird
type TinybirdReviewTimeByPRSizeData = {
  gitChangedLinesBucket: string,
  reviewedInSecondsAvg: number,
  pullRequestCount: number
};

export async function fetchReviewTimeByPRSize(filter: ReviewTimeByPRSizeFilter): Promise<ReviewTimeByPrItem[]> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const path = '/v0/pipes/pull_requests_review_time_by_size.json';

  const waitReviewTimeByPRSizeData = await fetchFromTinybird<TinybirdReviewTimeByPRSizeData[]>(path, filter);

  return waitReviewTimeByPRSizeData.data.map((item, index) => ({
    sortId: index,
    lines: item.gitChangedLinesBucket,
    prCount: item.pullRequestCount,
    averageReviewTime: item.reviewedInSecondsAvg,
    averageReviewTimeUnit: 'seconds',
  }));
}
