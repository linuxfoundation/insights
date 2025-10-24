// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/*
This is responsible for fetching the active contributors data from Tinybird.
The goal is to make the API endpoint oblivious to where the data comes from, since it's a separate service.
There's a bit of an overlap in responsibility between the API and this service because this returns the data
in the format the API will return to the client, which isn't ideal. If we ever need to use this for something else,
let's refactor it to return the data in a more generic format.
 */

import type { DateTime } from 'luxon';
import type { ActiveContributorsFilter } from '../types';
import { getPreviousDates } from '../util';
import type { TinybirdResponse } from './tinybird';
import { fetchFromTinybird } from './tinybird';
import type {
  TinybirdActiveContributorsData,
  TinybirdActiveContributorsSummary,
} from './responses.types';

export type ActiveContributorsDataPoint = {
  startDate: string;
  endDate: string;
  contributors: number;
};
export type ActiveContributorsResponse = {
  summary: {
    current: number; // Current number of active contributors
    previous: number; // Previous number of active contributors
    percentageChange: number; // Percentage change in active contributors
    changeValue: number; // Change in the number of active contributors
    periodFrom: DateTime; // Start of the period (e.g. last 90 days)
    periodTo: DateTime; // End of the period (e.g. last 90 days)
  };
  data: ActiveContributorsDataPoint[];
};

export async function fetchActiveContributors(filter: ActiveContributorsFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.
  const currentSummaryQuery = {
    project: filter.project,
    repos: filter.repos,
    includeCodeContributions: filter.includeCodeContributions,
    includeCollaborations: filter.includeCollaborations,
    startDate: dates.current.from,
    endDate: dates.current.to,
  };

  const previousSummaryQuery = {
    project: filter.project,
    repos: filter.repos,
    includeCodeContributions: filter.includeCodeContributions,
    includeCollaborations: filter.includeCollaborations,
    startDate: dates.previous.from,
    endDate: dates.previous.to,
  };

  const dataQuery = {
    project: filter.project,
    granularity: filter.granularity,
    repos: filter.repos,
    includeCodeContributions: filter.includeCodeContributions,
    includeCollaborations: filter.includeCollaborations,
    startDate: dates.current.from,
    endDate: dates.current.to,
  };

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdActiveContributorsSummary>(
      '/v0/pipes/active_contributors.json',
      currentSummaryQuery,
    ),
    fetchFromTinybird<TinybirdActiveContributorsSummary>(
      '/v0/pipes/active_contributors.json',
      previousSummaryQuery,
    ),
    fetchFromTinybird<TinybirdActiveContributorsData>(
      '/v0/pipes/active_contributors.json',
      dataQuery,
    ),
  ]);

  let processedData: ActiveContributorsDataPoint[] = [];
  if (data !== undefined) {
    processedData = (data as TinybirdResponse<TinybirdActiveContributorsData>)?.data.map(
      (item): ActiveContributorsDataPoint => ({
        startDate: item.startDate,
        endDate: item.endDate,
        contributors: item.contributorCount,
      }),
    );
  }

  const currentContributorCount = currentSummary.data[0].contributorCount;
  const previousContributorCount = previousSummary.data[0].contributorCount;
  const changeValue = currentContributorCount - previousContributorCount;
  let percentageChange = 0;
  if (previousContributorCount === 0 && currentContributorCount > 0) {
    percentageChange = 100;
  } else if (previousContributorCount === 0 && currentContributorCount === 0) {
    percentageChange = 0;
  } else if (previousContributorCount !== 0) {
    percentageChange =
      ((currentContributorCount - previousContributorCount) / previousContributorCount) * 100;
  }

  const response: ActiveContributorsResponse = {
    summary: {
      current: currentContributorCount,
      previous: previousContributorCount,
      percentageChange,
      changeValue,
      periodFrom: dates.current.from,
      periodTo: dates.current.to,
    },
    data: processedData,
  };

  return response;
}
