import type { Summary } from '~/components/shared/types/summary.types';

export interface WaitTime1stReview {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    waitTime: number;
  }[];
}
