// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import type { Granularity } from '~~/types/shared/granularity';

/*
 * These are the types that the API expects to receive.
 */

export enum CodeReviewEngagementMetric {
  PR_PARTICIPANTS = 'pr-participants',
  REVIEW_COMMENTS = 'review-comments',
  CODE_REVIEWS = 'code-reviews',
}
// Exactly one of project/collectionSlug is set by the caller - see DefaultFilter in
// server/data/types.ts for the same convention.
export type CodeReviewEngagementFilter = {
  project?: string;
  collectionSlug?: string;
  repos?: string[];
  granularity?: Granularity;
  metric: CodeReviewEngagementMetric;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ContributionsOutsideWorkHoursFilter = {
  project?: string;
  collectionSlug?: string;
  repos?: string[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
};

export type ActivityTypesFilter = {
  project: string;
  repos?: string[];
  includeCodeContributions?: boolean;
  includeCollaborations?: boolean;
  includeOtherContributions?: boolean;
};
