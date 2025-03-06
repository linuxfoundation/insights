import type { Summary } from '~/components/shared/types/summary.types';

export interface ActiveContributors {
  summary: Summary;
  data: {
    fromDate: string;
    toDate: string;
    contributorCount: number;
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
  percentage?: number;
  email: string;
}

export interface Organization {
  logo: string;
  name: string;
  contributions: number;
  percentage?: number;
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

export interface Dependency {
  count: number;
  percentage: number;
}

export interface ContributorDependency {
  topContributors: Dependency;
  otherContributors: Dependency;
  list: Contributor[];
}

export interface OrganizationDependency {
  topOrganizations: Dependency;
  otherOrganizations: Dependency;
  list: Organization[];
}
