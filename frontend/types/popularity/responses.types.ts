// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 These are the types for the responses the frontend expects from the API for the popularity tab in the project page.
 */
import type { Summary } from '../shared/summary.types';

export interface StarsData {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    stars: number;
  }[];
}

export interface ForksData {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    forks: number;
  }[];
}

export interface CommitActivities {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    commits: number;
  }[];
}

export interface MailingListsMessages {
  summary: Summary;
  data: {
    startDate: string;
    endDate: string;
    messages: number;
  }[];
}

export interface SearchQueries {
  data: {
    startDate: string;
    endDate: string;
    queryCount: number;
  }[];
}

export interface PackageDownloads {
  summary: {
    currentDownloads: number;
    previousDownloads: number;
    downloadsChangeValue: number;
    downloadsPercentageChange: number;

    currentDockerDownloads: number;
    previousDockerDownloads: number;
    dockerDownloadsChangeValue: number;
    dockerDownloadsPercentageChange: number;

    currentDockerDependents: number;
    previousDockerDependents: number;
    dockerDependentsChangeValue: number;
    dockerDependentsPercentageChange: number;

    currentDependentPackages: number;
    previousDependentPackages: number;
    dependentPackagesChangeValue: number;
    dependentPackagesPercentageChange: number;

    currentDependentRepos: number;
    previousDependentRepos: number;
    dependentReposChangeValue: number;
    dependentReposPercentageChange: number;

    periodFrom: string;
    periodTo: string;
  };
  data: {
    startDate: string;
    endDate: string;
    downloadsCount: number;
    dockerDownloadsCount: number;
    dockerDependentsCount: number;
    dependentPackagesCount: number;
    dependentReposCount: number;
  }[];
}

export interface Package {
  name: string;
  ecosystem: string;
  repo: string;
}

export interface PackageMetrics {
  startDate?: string;
  endDate?: string;
  downloadsCount: number;
  dockerDownloadsCount: number;
  dockerDependentsCount: number;
  dependentPackagesCount: number;
  dependentReposCount: number;
}
