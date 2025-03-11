import type { Summary } from '~~/types/shared/summary.types';

export interface ActiveDays {
  summary: Summary;
  avgContributions: number;
  data: {
    dateFrom: string;
    dateTo: string;
    contributions: number;
  }[];
}
