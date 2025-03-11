import type { Summary } from '~~/types/shared/summary.types';

export interface ResolutionSummary extends Summary {
  avgVelocityInDays: number;
}

export interface IssuesResolution {
  summary: ResolutionSummary;
  data: {
    dateFrom: string;
    dateTo: string;
    closedIssues: number;
    totalIssues: number;
  }[];
}
