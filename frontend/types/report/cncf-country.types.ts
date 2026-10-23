// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface CncfCountryQueryParams {
  countryCode: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CncfCountryTimeseriesQueryParams extends CncfCountryQueryParams {
  granularity: string;
}

export interface CncfCountrySummary {
  contributorCount: number;
  contributionCount: number;
  organizationCount: number;
  inCountryAtCountryOrganizationCount: number;
  inCountryElsewhereCount: number;
  abroadAtCountryOrganizationCount: number;
}

export interface CncfCountryTimeseriesPoint {
  startDate: string;
  endDate: string;
  contributorCount: number;
  contributionCount: number;
  organizationCount: number;
}

export type CncfCountryActivityMetric =
  | 'contributorCount'
  | 'contributionCount'
  | 'organizationCount';

export interface CncfCountryTimeseriesResponse {
  data: CncfCountryTimeseriesPoint[];
}

export interface CncfCountryProject {
  name: string;
  slug: string;
  logoUrl: string;
  contributorCount: number;
  contributionCount: number;
}

export interface CncfCountryProjectsResponse {
  data: CncfCountryProject[];
}

export interface CncfCountryOrganization {
  id: string;
  displayName: string;
  logo: string;
  slug: string;
  headquarteredInCountry: boolean;
  contributorCount: number;
  contributorInCountryCount: number;
  contributionCount: number;
}

export interface CncfCountryOrganizationsResponse {
  data: CncfCountryOrganization[];
}
