// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface GeoDistributionOverTimeDataPoint {
  startDate: string;
  endDate: string;
  country: string;
  countryCode: string;
  flag: string;
  contributorCount: number;
}

export interface GeoDistributionDataPoint {
  country: string;
  countryCode: string;
  flag: string;
  contributorCount: number;
  contributorPercentage: number;
}

export interface CncfGeoDistributionOverTimeResponse {
  data: GeoDistributionOverTimeDataPoint[];
  totalCountries: number;
}

export interface CncfGeoDistributionResponse {
  data: GeoDistributionDataPoint[];
}

export interface CncfGeoDistributionOverTimeQueryParams {
  collection: string;
  granularity: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CncfGeoDistributionQueryParams {
  collection: string;
  startDate?: string | null;
  endDate?: string | null;
}
