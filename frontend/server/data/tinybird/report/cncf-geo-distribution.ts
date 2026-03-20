// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import { fetchFromTinybird, type TinybirdResponse } from '../tinybird';
import type {
  GeoTimeseriesDataPoint,
  CncfGeoTimeseriesResponse,
  CncfGeoTimeseriesSummary,
} from '~~/types/report/cncf.types';

export interface CncfGeoDistributionFilter {
  projects: string[];
  startDate?: DateTime;
  endDate?: DateTime;
  granularity?: string;
  limit?: number;
}

type TinybirdGeoTimeseriesData = {
  date: string;
  country: string;
  country_code: string;
  flag: string;
  contributorCount: number;
}[];

export async function fetchCncfGeoDistribution(
  filter: CncfGeoDistributionFilter,
): Promise<CncfGeoTimeseriesResponse> {
  const data = await fetchFromTinybird<TinybirdGeoTimeseriesData>(
    '/v0/pipes/geo_distribution_timeseries.json',
    {
      projects: filter.projects,
      startDate: filter.startDate,
      endDate: filter.endDate,
      granularity: filter.granularity || 'monthly',
      limit: filter.limit || 10,
    },
  );

  const processedData: GeoTimeseriesDataPoint[] = (
    data as TinybirdResponse<TinybirdGeoTimeseriesData>
  )?.data.map(
    (item): GeoTimeseriesDataPoint => ({
      date: item.date,
      country: item.country,
      countryCode: item.country_code,
      flag: item.flag,
      contributorCount: item.contributorCount,
    }),
  );

  const summary = calculateSummary(processedData, filter);

  return {
    summary,
    data: processedData,
  };
}

function calculateSummary(
  data: GeoTimeseriesDataPoint[],
  filter: CncfGeoDistributionFilter,
): CncfGeoTimeseriesSummary {
  const uniqueCountries = new Set<string>();
  const countryTotals = new Map<string, number>();

  data.forEach((item) => {
    uniqueCountries.add(item.countryCode);
    const current = countryTotals.get(item.country) || 0;
    countryTotals.set(item.country, current + item.contributorCount);
  });

  let topCountry = '';
  let maxContributors = 0;
  countryTotals.forEach((count, country) => {
    if (count > maxContributors) {
      maxContributors = count;
      topCountry = country;
    }
  });

  const latestDateData = data.filter((item) => {
    const maxDate = data.reduce((max, d) => (d.date > max ? d.date : max), '');
    return item.date === maxDate;
  });
  const totalContributors = latestDateData.reduce((sum, item) => sum + item.contributorCount, 0);

  return {
    totalContributors,
    totalCountries: uniqueCountries.size,
    topCountry,
    periodStart: filter.startDate?.toFormat('yyyy-MM-dd') || '',
    periodEnd: filter.endDate?.toFormat('yyyy-MM-dd') || '',
  };
}
