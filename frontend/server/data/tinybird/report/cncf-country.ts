// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';

import type {
  CncfCountryComparisonCounts,
  CncfCountryComparisonPoint,
  CncfCountryComparisonResponse,
  CncfCountryOrganization,
  CncfCountryOrganizationsResponse,
  CncfCountryProjectsResponse,
  CncfCountrySummary,
  CncfCountryTimeseriesResponse,
} from '~~/types/report/cncf-country.types';

import { fetchFromTinybird } from '../tinybird';

export interface CncfCountryFilter {
  countryCode: string;
  startDate?: DateTime;
  endDate?: DateTime;
}

interface TinybirdCncfCountryOrganization extends Omit<
  CncfCountryOrganization,
  'headquarteredInCountry'
> {
  headquarteredInCountry: number;
}

const EMPTY_SUMMARY: CncfCountrySummary = {
  contributorCount: 0,
  contributionCount: 0,
  organizationCount: 0,
  inCountryAtCountryOrganizationCount: 0,
  inCountryElsewhereCount: 0,
  abroadAtCountryOrganizationCount: 0,
};

// The report counts code contributions only, the default of `activityTypes_filtered`.
const contributionParams = (filter: CncfCountryFilter) => ({
  countryCode: filter.countryCode,
  startDate: filter.startDate,
  endDate: filter.endDate,
});

export async function fetchCncfCountrySummary(
  filter: CncfCountryFilter,
): Promise<CncfCountrySummary> {
  const result = await fetchFromTinybird<CncfCountrySummary[]>(
    '/v0/pipes/cncf_country_summary.json',
    contributionParams(filter),
  );

  return result.data[0] ?? EMPTY_SUMMARY;
}

export async function fetchCncfCountryTimeseries(
  filter: CncfCountryFilter & { granularity: string },
): Promise<CncfCountryTimeseriesResponse> {
  const result = await fetchFromTinybird<CncfCountryTimeseriesResponse['data']>(
    '/v0/pipes/cncf_country_activity_timeseries.json',
    { ...contributionParams(filter), granularity: filter.granularity },
  );

  // endDate is exclusive, but generate_timeseries includes the period that starts on it.
  const end = filter.endDate?.toFormat('yyyy-MM-dd');
  return { data: end ? result.data.filter((point) => point.startDate < end) : result.data };
}

export async function fetchCncfCountryProjects(
  filter: CncfCountryFilter & { limit: number },
): Promise<CncfCountryProjectsResponse> {
  const result = await fetchFromTinybird<CncfCountryProjectsResponse['data']>(
    '/v0/pipes/cncf_country_top_projects.json',
    { ...contributionParams(filter), limit: filter.limit },
  );

  return { data: result.data };
}

export function mapCncfCountryOrganizations(
  rows: TinybirdCncfCountryOrganization[],
): CncfCountryOrganization[] {
  return rows.map((row) => ({ ...row, headquarteredInCountry: row.headquarteredInCountry === 1 }));
}

export async function fetchCncfCountryOrganizations(
  filter: CncfCountryFilter & { limit: number },
): Promise<CncfCountryOrganizationsResponse> {
  const result = await fetchFromTinybird<TinybirdCncfCountryOrganization[]>(
    '/v0/pipes/cncf_country_top_organizations.json',
    { ...contributionParams(filter), limit: filter.limit },
  );

  return { data: mapCncfCountryOrganizations(result.data) };
}

const EMPTY_COMPARISON: CncfCountryComparisonCounts = {
  countryContributorCount: 0,
  regionContributorCount: 0,
  worldContributorCount: 0,
  countryContributionCount: 0,
  regionContributionCount: 0,
  worldContributionCount: 0,
  countryOrganizationCount: 0,
  regionOrganizationCount: 0,
  worldOrganizationCount: 0,
};

export async function fetchCncfCountryComparison(
  filter: CncfCountryFilter & { region: { name: string; codes: string[] }; granularity: string },
): Promise<CncfCountryComparisonResponse> {
  const params = { ...contributionParams(filter), regionCodes: filter.region.codes };
  const [totals, series] = await Promise.all([
    fetchFromTinybird<CncfCountryComparisonCounts[]>(
      '/v0/pipes/cncf_country_comparison.json',
      params,
    ),
    fetchFromTinybird<CncfCountryComparisonPoint[]>('/v0/pipes/cncf_country_comparison.json', {
      ...params,
      granularity: filter.granularity,
    }),
  ]);

  // endDate is exclusive, but generate_timeseries includes the period that starts on it.
  const end = filter.endDate?.toFormat('yyyy-MM-dd');
  return {
    regionName: filter.region.name,
    totals: totals.data[0] ?? EMPTY_COMPARISON,
    data: end ? series.data.filter((point) => point.startDate < end) : series.data,
  };
}
