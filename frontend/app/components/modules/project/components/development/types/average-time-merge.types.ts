import type { Summary } from '~~/types/shared/summary.types';

export interface AverageTimeMerge {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    averageTime: number;
  }[];
}
