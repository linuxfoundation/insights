import type { Summary } from '~~/types/shared/summary.types';

export interface WaitTime1stReview {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    waitTime: number;
  }[];
}
