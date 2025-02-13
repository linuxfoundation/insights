import type { Summary } from './summary.types';

export interface ActiveContributors {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    contributors: number;
  }[];
}

export interface ActiveOrganizations {
  summary: Summary;
  data: {
    dateFrom: string;
    dateTo: string;
    organizations: number;
  }[];
}
