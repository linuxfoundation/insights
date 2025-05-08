// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { RetentionFilter } from "../types";
import { DemographicType } from "../types";
import { fetchFromTinybird, type TinybirdResponse } from './tinybird'

// This is one data point in the response
export type RetentionDataPoint = {
  startDate: string;
  endDate: string;
  percentage: number;
};

// This is the response this function returns
export type RetentionResponse = RetentionDataPoint[];

// This is the data part of the response from Tinybird
type TinybirdRetentionData = {
  startDate: string,
  endDate: string,
  retentionRate: number,
}[];

export async function fetchRetention(filter: RetentionFilter) {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const queryType = filter?.demographicType as DemographicType || DemographicType.CONTRIBUTORS;

  // Default to contributors data and use organizations data if that type is set in the query.
  let path = 'contributor_retention.json';
  if (queryType === DemographicType.ORGANIZATIONS) {
    path = 'organization_retention.json';
  }

  const data = await fetchFromTinybird<TinybirdRetentionData>(
    `/v0/pipes/${path}`,
    filter
  );

  const processedData: RetentionDataPoint[] = (data as TinybirdResponse<TinybirdRetentionData>)?.data.map(
    (item): RetentionDataPoint => ({
      startDate: item.startDate,
      endDate: item.endDate,
      percentage: item.retentionRate,
    })
  );

  const response: RetentionResponse = processedData;

  return response;
}
