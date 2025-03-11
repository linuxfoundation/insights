import type { Summary } from '~~/types/shared/summary.types';

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
