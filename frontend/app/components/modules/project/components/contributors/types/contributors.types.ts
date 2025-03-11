import type { Summary, Meta } from '~~/types/shared/summary.types';

export interface ActiveContributors {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    contributors: number;
  }[];
}

export interface ActiveOrganizations {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    organizations: number;
  }[];
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

export interface GranularityTabs {
  label: string;
  value: string;
  format: string;
  showForKeys: string[];
}
