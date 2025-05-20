// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface ProjectRepository {
  url: string;
  name: string;
  slug: string;
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
  widgets: string[];
  softwareValue?: number;
  maturityStatus?: string;
  tags?: string[];
  languages?: ProjectLanguage[];
  firstCommit?: string;
  projectLinks?: ProjectLink[];
  connectedPlatforms: string[];
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
  keywords?: string[];
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  widgets: string[];
  firstCommit?: string;
  connectedPlatforms: string[];
}
