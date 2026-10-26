// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';

import type {
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
