// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface GeoTimeseriesDataPoint {
  date: string;
  country: string;
  countryCode: string;
  flag: string;
  contributorCount: number;
}

export interface CncfGeoTimeseriesSummary {
  totalContributors: number;
  totalCountries: number;
  topCountry: string;
  periodStart: string;
  periodEnd: string;
}

export interface CncfGeoTimeseriesResponse {
  summary: CncfGeoTimeseriesSummary;
  data: GeoTimeseriesDataPoint[];
}

export interface CncfGeoTimeseriesQueryParams {
  startDate?: string | null;
  endDate?: string | null;
  granularity?: string;
  limit?: number;
}
