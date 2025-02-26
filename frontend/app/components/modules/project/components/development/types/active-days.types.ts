import type { Summary } from '~/components/shared/types/summary.types';

export interface ActiveDays {
  summary: Summary;
  avgContributions: number;
  data: {
    dateFrom: string;
    dateTo: string;
    contributions: number;
  }[];
}
