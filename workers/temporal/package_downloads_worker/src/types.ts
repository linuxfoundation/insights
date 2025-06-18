// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface ISavePackageDownloadParams {
  insightsProjectId?: string;
  date: string;
  repoUrl: string;
}

export interface IPackageDownload {
  id: number;
  insights_project_id: string;
  date: string;
  repository_url: string;
  name: string;
  ecosystem: string;
  purl: string;
  dependent_repos_count: number;
  dependent_packages_count: number;
  docker_dependents_count: number;
  docker_downloads_count: number;
  downloads_count: number;
}

export interface IPackageDownloadEcosystemsResponse {
  id: number;
  insights_project_id: string;
  date: string;
  repository_url: string;
  name: string;
  ecosystem: string;
  purl: string;
  dependent_repos_count: number;
  dependent_packages_count: number;
  docker_dependents_count: number;
  docker_downloads_count: number;
  downloads: number;
}

export interface IInsightsProjectRepo {
  insightsProjectId: string;
  repoUrl: string;
}

export interface IPackageDownloadsRepo {
  insights_project_id: string;
  repository_url: string;
}

export interface ITriggerPackageDownloadsCheckForReposParams {
  failedRepoUrls?: string[];
  testRun?: boolean;
}
