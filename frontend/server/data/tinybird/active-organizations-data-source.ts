// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/*
This is responsible for fetching the active organizations data from Tinybird.
The goal is to make the API endpoint oblivious to where the data comes from, since it's a separate service.
There's a bit of an overlap in responsibility between the API and this service because this returns the data
in the format the API will return to the client, which isn't ideal. If we ever need to use this for something else,
let's refactor it to return the data in a more generic format.
 */

import type {DateTime} from "luxon";
import type {ActiveOrganizationsFilter} from "../types";
import {getPreviousDates} from "../util";
import type {TinybirdResponse} from './tinybird';
import {fetchFromTinybird} from './tinybird'

export type ActiveOrganizationsDataPoint = {
  startDate: string;
  endDate: string;
  organizations: number;
};
export type ActiveOrganizationsResponseData = ActiveOrganizationsDataPoint[];
export type ActiveOrganizationsResponse = {
  summary: {
    current: number; // Current number of active organizations
    previous: number; // Previous number of active organizations
    percentageChange: number; // Percentage change in active organizations
    changeValue: number; // Change in the number of active organizations
    periodFrom: DateTime; // Start of the period (e.g. last 90 days)
    periodTo: DateTime; // End of the period (e.g. last 90 days)
  };
  data: ActiveOrganizationsResponseData
};

type TinybirdActiveOrganizationsSummary = {
  organizationCount: number;
}[];

type TinybirdActiveOrganizationsData = {
  startDate: string;
  endDate: string;
  organizationCount: number;
}[];

export async function fetchActiveOrganizations(filter: ActiveOrganizationsFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.
  const currentSummaryQuery = {
    project: filter.project,
    repos: filter.repos,
    startDate: dates.current.from,
    endDate: dates.current.to
  };

  const previousSummaryQuery = {
    project: filter.project,
    repos: filter.repos,
    startDate: dates.previous.from,
    endDate: dates.previous.to
  };

  const dataQuery = {
    project: filter.project,
    granularity: filter.granularity,
    repos: filter.repos,
    startDate: dates.current.from,
    endDate: dates.current.to
  };

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdActiveOrganizationsSummary>('/v0/pipes/active_organizations.json', currentSummaryQuery),
    fetchFromTinybird<TinybirdActiveOrganizationsSummary>('/v0/pipes/active_organizations.json', previousSummaryQuery),
    fetchFromTinybird<TinybirdActiveOrganizationsData>('/v0/pipes/active_organizations.json', dataQuery)
  ]);

  let processedData: ActiveOrganizationsResponseData = [];
  if (data !== undefined) {
    processedData = (data as TinybirdResponse<TinybirdActiveOrganizationsData>)?.data.map(
      (item): ActiveOrganizationsDataPoint => ({
        startDate: item.startDate,
        endDate: item.endDate,
        organizations: item.organizationCount
      })
    );
  }

  const currentOrganizationCount = currentSummary.data[0].organizationCount;
  const previousOrganizationCount = previousSummary.data[0].organizationCount;
  const changeValue = currentOrganizationCount - previousOrganizationCount;
  let percentageChange = 0;
  if (previousOrganizationCount === 0 && currentOrganizationCount > 0) {
    percentageChange = 100;
  } else if (previousOrganizationCount === 0 && currentOrganizationCount === 0) {
    percentageChange = 0;
  } else if (previousOrganizationCount !== 0) {
    percentageChange = ((currentOrganizationCount - previousOrganizationCount) / previousOrganizationCount) * 100;
  }

  const response: ActiveOrganizationsResponse = {
    summary: {
      current: currentOrganizationCount,
      previous: previousOrganizationCount,
      percentageChange,
      changeValue,
      periodFrom: dates.current.from,
      periodTo: dates.current.to,
    },
    data: processedData,
  };

  return response;
}
