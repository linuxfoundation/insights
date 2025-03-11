import type { Summary } from '../shared/summary.types';

export interface ActiveDays {
  summary: Summary;
  avgContributions: number;
  data: {
    dateFrom: string;
    dateTo: string;
    contributions: number;
  }[];
}

export interface AverageTimeMerge {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    averageTime: number;
  }[];
}

export interface CodeReviewItem {
  avatar: string;
  name: string;
  activityCount: number;
  percentage?: number;
  email: string;
}

export interface CodeReviewEngagement {
  summary: Summary;
  data: CodeReviewItem[];
}

export interface ContributionOutsideHours {
  summary: Summary;
  weekdayOutsideHoursPercentage: number;
  weekendOutsideHoursPercentage: number;
  data: {
    day: string;
    hour: string;
    contributions: number;
  }[];
}

export interface ResolutionSummary extends Summary {
  avgVelocityInDays: number;
}

export interface IssuesResolution {
  summary: ResolutionSummary;
  data: {
    dateFrom: string;
    dateTo: string;
    closedIssues: number;
    totalIssues: number;
  }[];
}

export interface MergeLeadTimeItem {
  value: number;
  unit: string;
  changeType: string;
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
  openSummary: Summary;
  mergedSummary: Summary;
  closedSummary: Summary;
  avgVelocityInDays: number;
  data: {
    dateFrom: string;
    dateTo: string;
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
    dateFrom: string;
    dateTo: string;
    waitTime: number;
  }[];
}
