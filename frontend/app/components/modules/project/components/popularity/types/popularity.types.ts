import type { Summary } from '~/components/shared/types/summary.types';

export interface StarsData {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    stars: number;
  }[];
}

export interface ForksData {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    forks: number;
  }[];
}
