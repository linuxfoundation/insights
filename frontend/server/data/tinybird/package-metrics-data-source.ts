// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';

import type { PackageMetricsFilter } from '../types';
import { fetchFromTinybird } from './tinybird';
import type { PackageMetrics } from '~~/types/popularity/responses.types';

import { getPreviousDates } from '~~/server/data/util';

export type PackageDownloadsResponse = {
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

    periodFrom: DateTime;
    periodTo: DateTime;
  };
  data: PackageMetrics[];
};

export async function fetchPackageMetrics(filter: PackageMetricsFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const currentSummaryQuery = {
    project: filter.project,
    repos: filter.repos,
    ecosystem: filter.ecosystem,
    name: filter.name,
    startDate: dates.current.from,
    endDate: dates.current.to,
  };

  const previousSummaryQuery = {
    project: filter.project,
    repos: filter.repos,
    ecosystem: filter.ecosystem,
    name: filter.name,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  const dataQuery = {
    project: filter.project,
    granularity: filter.granularity,
    ecosystem: filter.ecosystem,
    name: filter.name,
    repos: filter.repos,
    startDate: dates.current.from,
    endDate: dates.current.to,
  };

  const [currentSummary, previousSummary, timeseries] = await Promise.all([
    fetchFromTinybird<PackageMetrics[]>('/v0/pipes/package_metrics.json', currentSummaryQuery),
    fetchFromTinybird<PackageMetrics[]>('/v0/pipes/package_metrics.json', previousSummaryQuery),
    fetchFromTinybird<PackageMetrics[]>('/v0/pipes/package_metrics.json', dataQuery),
  ]);

  const currentDownloads = currentSummary.data[0]?.downloadsCount || 0;
  const previousDownloads = previousSummary.data[0]?.downloadsCount || 0;
  const downloadsChangeValue = currentDownloads - previousDownloads;
  const downloadsPercentageChange = getPercentageChange(currentDownloads, previousDownloads);

  const currentDockerDownloads = currentSummary.data[0]?.dockerDownloadsCount || 0;
  const previousDockerDownloads = previousSummary.data[0]?.dockerDownloadsCount || 0;
  const dockerDownloadsChangeValue = currentDockerDownloads - previousDockerDownloads;
  const dockerDownloadsPercentageChange = getPercentageChange(
    currentDockerDownloads,
    previousDockerDownloads,
  );

  const currentDockerDependents = currentSummary.data[0]?.dockerDependentsCount || 0;
  const previousDockerDependents = previousSummary.data[0]?.dockerDependentsCount || 0;
  const dockerDependentsChangeValue = currentDockerDependents - previousDockerDependents;
  const dockerDependentsPercentageChange = getPercentageChange(
    currentDockerDependents,
    previousDockerDependents,
  );

  const currentDependentPackages = currentSummary.data[0]?.dependentPackagesCount || 0;
  const previousDependentPackages = previousSummary.data[0]?.dependentPackagesCount || 0;
  const dependentPackagesChangeValue = currentDependentPackages - previousDependentPackages;
  const dependentPackagesPercentageChange = getPercentageChange(
    currentDependentPackages,
    previousDependentPackages,
  );

  const currentDependentRepos = currentSummary.data[0]?.dependentReposCount || 0;
  const previousDependentRepos = previousSummary.data[0]?.dependentReposCount || 0;
  const dependentReposChangeValue = currentDependentRepos - previousDependentRepos;
  const dependentReposPercentageChange = getPercentageChange(
    currentDependentRepos,
    previousDependentRepos,
  );

  const response: PackageDownloadsResponse = {
    summary: {
      currentDownloads,
      previousDownloads,
      downloadsChangeValue,
      downloadsPercentageChange,

      currentDockerDownloads,
      previousDockerDownloads,
      dockerDownloadsChangeValue,
      dockerDownloadsPercentageChange,

      currentDockerDependents,
      previousDockerDependents,
      dockerDependentsChangeValue,
      dockerDependentsPercentageChange,

      currentDependentPackages,
      previousDependentPackages,
      dependentPackagesChangeValue,
      dependentPackagesPercentageChange,

      currentDependentRepos,
      previousDependentRepos,
      dependentReposChangeValue,
      dependentReposPercentageChange,

      periodFrom: dates.current.from,
      periodTo: dates.current.to,
    },
    data: timeseries.data,
  };

  return response;
}

function getPercentageChange(currentValue: number, previousValue: number): number {
  let percentageChange = 0;

  if (previousValue === 0 && currentValue > 0) {
    percentageChange = 100;
  } else if (previousValue === 0 && currentValue === 0) {
    percentageChange = 0;
  } else if (previousValue !== 0) {
    percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  }

  return percentageChange;
}
