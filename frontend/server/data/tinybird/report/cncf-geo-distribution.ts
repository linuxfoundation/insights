// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import { fetchFromTinybird } from '../tinybird';
import type {
  GeoDistributionOverTimeDataPoint,
  GeoDistributionDataPoint,
  CncfGeoDistributionOverTimeResponse,
  CncfGeoDistributionResponse,
} from '~~/types/report/cncf.types';

// Tinybird raw response types
interface TinybirdGeoDistributionOverTimeItem {
  startDate: string;
  endDate: string;
  country: string;
  flag: string;
  country_code: string;
  contributorCount: number;
}

interface TinybirdGeoDistributionItem {
  country: string;
  flag: string;
  country_code: string;
  contributorCount: number;
  contributorPercentage: number;
}

export interface CollectionGeoDistributionFilter {
  collection: string;
  startDate?: DateTime;
  endDate?: DateTime;
  granularity?: string;
}

export async function fetchCollectionGeoDistributionOverTime(
  filter: CollectionGeoDistributionFilter,
): Promise<CncfGeoDistributionOverTimeResponse> {
  const data = await fetchFromTinybird<TinybirdGeoDistributionOverTimeItem[]>(
    '/v0/pipes/collection_contributors_geo_distribution_over_time.json',
    {
      collection: filter.collection,
      granularity: filter.granularity || 'monthly',
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
  );

  const processedData: GeoDistributionOverTimeDataPoint[] = data.data.map((item) => ({
    startDate: item.startDate,
    endDate: item.endDate,
    country: item.country,
    countryCode: item.country_code,
    flag: item.flag,
    contributorCount: item.contributorCount,
  }));

  const uniqueCountries = new Set(processedData.map((d) => d.countryCode));

  return {
    data: processedData,
    totalCountries: uniqueCountries.size,
  };
}

export async function fetchCollectionGeoDistribution(
  filter: Omit<CollectionGeoDistributionFilter, 'granularity'>,
): Promise<CncfGeoDistributionResponse> {
  const data = await fetchFromTinybird<TinybirdGeoDistributionItem[]>(
    '/v0/pipes/collection_contributors_geo_distribution.json',
    {
      collection: filter.collection,
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
  );

  const processedData: GeoDistributionDataPoint[] = data.data.map((item) => ({
    country: item.country,
    countryCode: item.country_code,
    flag: item.flag,
    contributorCount: item.contributorCount,
    contributorPercentage: item.contributorPercentage,
  }));

  return {
    data: processedData,
  };
}
