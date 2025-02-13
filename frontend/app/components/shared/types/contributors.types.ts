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

export interface Meta {
  offset: number;
  limit: number;
  total: number;
}

export interface Contributor {
  avatar: string;
  name: string;
  contributions: number;
  email: string;
}

export interface Organization {
  logo: string;
  name: string;
  contributions: number;
  website: string;
}

export interface ContributorLeaderboard {
  meta: Meta;
  data: Contributor[];
}

export interface OrganizationLeaderboard {
  meta: Meta;
  data: Organization[];
}
