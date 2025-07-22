// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
These are the types for the responses the frontend expects from the API for the development tab in the project page.
 */

import type { Summary } from '../shared/summary.types';

export interface ActiveDays {
  summary: Summary;
  avgContributions: number;
  data: {
    day: number;
    startDate: string;
    endDate: string;
    contributions: number;
  }[];
}

export interface AverageTimeMerge {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    averageTime: number;
  }[];
}

export interface CodeReviewEngagementPRParticipantsItem {
  avatar: string;
  name: string;
  activityCount: number;
  percentage?: number;
  roles: string[];
}

export interface CodeReviewEngagementCommentsItem {
  startDate: string;
  endDate: string;
  comments: number;
}

export interface CodeReviewEngagementReviewsItem {
  startDate: string;
  endDate: string;
  reviews: number;
}

export interface CodeReviewEngagement {
  summary: Summary;
  data:
    CodeReviewEngagementPRParticipantsItem[] |
    CodeReviewEngagementCommentsItem[] |
    CodeReviewEngagementReviewsItem[];
}

export interface ContributionOutsideHours {
  summary: Summary;
  weekdayOutsideHoursPercentage: number;
  weekendOutsideHoursPercentage: number;
  data: {
    day: number; // day of the week, 0 is monday
    hour: number;
    contributions: number;
  }[];
}

export interface IssuesResolutionSummary extends Summary {
  avgVelocityInDays: number;
}

export interface IssuesResolutionData {
  dateFrom: string;
  dateTo: string;
  closedIssues: number;
  totalIssues: number;
}

export interface IssuesResolution {
  summary: IssuesResolutionSummary;
  data: IssuesResolutionData[];
}

export type MergeLeadTimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';

export interface MergeLeadTimeItem {
  value: number;
  unit: MergeLeadTimeUnit;
  changeType: 'positive' | 'negative';
}
export interface MergeLeadTime {
  summary: Summary;
  data: {
    pickup: MergeLeadTimeItem;
    review: MergeLeadTimeItem;
    accepted: MergeLeadTimeItem;
    prMerged: MergeLeadTimeItem;
  };
}

export interface PullRequests {
  summary: Summary;
  openedSummary: Summary;
  mergedSummary: Summary;
  closedSummary: Summary;
  avgVelocityInDays: number;
  data: {
    startDate: string;
    endDate: string;
    open: number;
    merged: number;
    closed: number;
  }[];
}

export interface ReviewTimeByPrItem {
  sortId: number;
  lines: string;
  prCount: number;
  averageReviewTime: number;
  averageReviewTimeUnit: string;
}

export interface WaitTime1stReview {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    waitTime: number;
  }[];
}
