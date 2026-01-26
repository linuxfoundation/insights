// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface ProjectRepository {
  url: string;
  name: string;
  slug: string;
  score: number;
  rank: number;
}

export interface ProjectRepositoryGroup {
  name: string;
  slug: string;
  repositories: string[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  isLF: boolean;
  contributorCount: number;
  organizationCount: number;
  repositories: ProjectRepository[];
  repositoryGroups: ProjectRepositoryGroup[];
  archivedRepositories: string[];
  excludedRepositories: string[];
  widgets: string[];
  softwareValue?: number;
  maturityStatus?: string;
  tags?: string[];
  languages?: ProjectLanguage[];
  firstCommit?: string;
  firstCommitUrl?: string;
  projectLinks?: ProjectLink[];
  connectedPlatforms: string[];
  score: number;
  rank: number;
  healthScore: number;
  communityPlatforms: string[];
  communityKeywords: string[];
  communityLanguages: string[];
  status: string;
}

export interface ProjectLanguage {
  name: string;
  percentage: number;
}

export interface ProjectLink {
  name?: string;
  url: string;
  img?: string;
  icon?: string;
}

export interface ProjectList {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  isLF: boolean;
  contributorCount: number;
  organizationCount: number;
  repositories: string[];
}

export type ProjectRepoData = [url: string, score: number, rank: number];

export interface ProjectTinybird {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  isLF: number;
  contributorCount: number;
  organizationCount: number;
  repositories: string[];
  archivedRepositories: string[];
  excludedRepositories: string[];
  keywords?: string[];
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  widgets: string[];
  firstCommit?: string;
  firstCommitUrl?: string;
  connectedPlatforms: string[];
  repoData: ProjectRepoData[];
}

export interface ProjectInsights {
  id: string;
  name: string;
  slug: string;
  softwareValue: number;
  healthScore: number;
  firstCommit: string;
  starsLast365Days: number;
  forksLast365Days: number;
  activeContributorsLast365Days: number;
  activeOrganizationsLast365Days: number;
  starsPrevious365Days: number;
  forksPrevious365Days: number;
  activeContributorsPrevious365Days: number;
  activeOrganizationsPrevious365Days: number;
}
