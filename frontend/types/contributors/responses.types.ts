// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Summary, Meta } from '../shared/summary.types';

export interface ActiveContributors {
  summary: Summary;
  maintainerCount: number;
  reviewerCount: number;
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
  id?: string;
  avatar: string;
  name: string;
  contributions: number;
  percentage?: number;
  roles?: string[];
}

export interface Organization {
  logo: string;
  name: string;
  contributions: number;
  percentage?: number;
  website: string;
  description?: string;
  address?: string;
  employees?: string;
  organizationType?: string;
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

export interface Retention {
  startDate: string;
  endDate: string;
  percentage: number;
}
