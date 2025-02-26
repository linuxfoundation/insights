import type { Summary } from '~/components/shared/types/summary.types';

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
