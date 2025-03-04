import type { Summary } from '~/components/shared/types/summary.types';

export interface AverageTimeMerge {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    averageTime: number;
  }[];
}
