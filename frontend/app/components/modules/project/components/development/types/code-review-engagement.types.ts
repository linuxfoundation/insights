import type { Summary } from '~~/types/shared/summary.types';

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
