// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from "luxon";

import type { PackageMetricsFilter } from "../types";
import { fetchFromTinybird } from "./tinybird";
import type { PackageMetrics } from "~~/types/popularity/responses.types";

import {
  getPreviousDates,
} from "~~/server/data/util";

export type PackageDownloadsResponse = {
  summary: {
    current: number; // Current number of active contributors
    previous: number; // Previous number of active contributors
    percentageChange: number; // Percentage change in active contributors
    changeValue: number; // Change in the number of active contributors
    periodFrom: DateTime; // Start of the period (e.g. last 90 days)
    periodTo: DateTime; // End of the period (e.g. last 90 days)
  };
  data: PackageMetrics[];
};

export async function fetchPackageMetrics(filter: PackageMetricsFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const currentSummaryQuery = {
    project: filter.project,
    repo: filter.repo,
    ecosystem: filter.ecosystem,
    name: filter.name,
    startDate: dates.current.from,
    endDate: dates.current.to,
  };

  const previousSummaryQuery = {
    project: filter.project,
    repo: filter.repo,
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
    repo: filter.repo,
    startDate: dates.current.from,
    endDate: dates.current.to,
  };

  console.log(dataQuery)

  const [currentSummary, previousSummary, timeseries] = await Promise.all([
    fetchFromTinybird<PackageMetrics[]>(
      "/v0/pipes/package_metrics.json",
      currentSummaryQuery
    ),
    fetchFromTinybird<PackageMetrics[]>(
      "/v0/pipes/package_metrics.json",
      previousSummaryQuery
    ),
    fetchFromTinybird<PackageMetrics[]>(
      "/v0/pipes/package_metrics.json",
      dataQuery
    ),
  ]);

  const currentDownloadsCount = currentSummary.data[0]?.downloadsCount || 0;
  const previousDownloadsCount = previousSummary.data[0]?.downloadsCount || 0;

  const changeValue = currentDownloadsCount - previousDownloadsCount;
  let percentageChange = 0;
  if (previousDownloadsCount === 0 && currentDownloadsCount > 0) {
    percentageChange = 100;
  } else if (previousDownloadsCount === 0 && currentDownloadsCount === 0) {
    percentageChange = 0;
  } else if (previousDownloadsCount !== 0) {
    percentageChange = ((currentDownloadsCount - previousDownloadsCount) / previousDownloadsCount) * 100;
  }

  const response: PackageDownloadsResponse = {
    summary: {
      current: currentDownloadsCount,
      previous: previousDownloadsCount,
      percentageChange,
      changeValue,
      periodFrom: dates.current.from,
      periodTo: dates.current.to,
    },
    data: timeseries.data,
  };

  return response;
}
