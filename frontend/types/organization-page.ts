// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface OrganizationProfile {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  description: string;
  domain?: string;
  employeeCount?: number;
  industry?: string[];
  website?: string;
  membershipTier?: 'silver' | 'gold' | 'platinum';
}

export interface OrganizationKpis {
  activeContributors: number;
  activeContributorsTrend: number;
  activeContributorsTrendAbsolute: number;
  activeContributorsTrendPrevious: number;
  maintainerRoles: number;
  criticalProjects: number;
}

export interface OrganizationProject {
  projectSlug: string;
  projectName: string;
  projectLogo: string;
  healthScore: 'excellent' | 'healthy' | 'growing' | 'needs-attention';
  technicalInfluence: 'leading' | 'contributing' | 'participating';
  activityCount: number;
  contributorCount: number;
}

export interface OrgActivityTimeseries {
  startDate: string;
  endDate: string;
  activityCount: number;
}

export interface OrgContributorTimeseries {
  startDate: string;
  endDate: string;
  contributorCount: number;
}

export interface OrgContributor {
  id: string;
  name: string;
  avatar: string;
  contributions: number;
  roles: string[];
}
