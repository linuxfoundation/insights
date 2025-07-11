// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {DateTime} from "luxon";

/*
 * These are the types that the API expects to receive.
 */

export enum CodeReviewEngagementMetric {
  PR_PARTICIPANTS = 'pr-participants',
  REVIEW_COMMENTS = 'review-comments',
  CODE_REVIEWS = 'code-reviews',
}
export type CodeReviewEngagementFilter = {
  project: string,
  repos?: string[],
  metric: CodeReviewEngagementMetric,
  startDate?: DateTime,
  endDate?: DateTime,
};

export type ContributionsOutsideWorkHoursFilter = {
  project: string,
  repos?: string[],
  startDate?: DateTime,
  endDate?: DateTime,
};
