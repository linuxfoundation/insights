// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { CncfGeoTimeseriesResponse, GeoTimeseriesDataPoint } from '~~/types/report/cncf.types';

/**
 * API Endpoint: /api/report/cncf/geo-distribution
 * Method: GET
 * Description: Fetches time-series geographical distribution of contributors across all CNCF projects.
 *
 * Query Parameters:
 * - startDate (string, optional): Start date in ISO format
 * - endDate (string, optional): End date in ISO format
 * - granularity (string, optional): 'monthly' or 'quarterly'. Default: 'monthly'
 * - limit (number, optional): Top N countries to return. Default: 10
 *
 * Response:
 * - summary: Summary statistics including total contributors, countries, and top country
 * - data: Array of time-series data points with date, country, and contributor count
 *
 * Note: This endpoint currently returns mock data. Once the TinyBird pipe
 * `geo_distribution_timeseries.json` is created, this will be updated to use real data.
 */
export default defineEventHandler(async (event): Promise<CncfGeoTimeseriesResponse> => {
  const query = getQuery(event);

  // For "all time", default to 10 years of data
  const startDate = query.startDate
    ? DateTime.fromISO(query.startDate as string)
    : DateTime.now().minus({ years: 10 });
  const endDate = query.endDate
    ? DateTime.fromISO(query.endDate as string)
    : DateTime.now();
  const granularity = (query.granularity as string) || 'monthly';
  const limit = Number(query.limit) || 10;

  // TODO: Replace mock data with real TinyBird query once the pipe exists
  // Uncomment the following once geo_distribution_timeseries.json pipe is created:
  //
  // import { fetchCncfGeoDistribution } from '~~/server/data/tinybird/report/cncf-geo-distribution';
  //
  // const cncfProjectSlugs = await getCncfChildProjectSlugs();
  // return await fetchCncfGeoDistribution({
  //   projects: cncfProjectSlugs,
  //   startDate,
  //   endDate,
  //   granularity,
  //   limit,
  // });

  const mockData = generateMockData(startDate, endDate, granularity, limit);
  return mockData;
});

function generateMockData(
  startDate: DateTime,
  endDate: DateTime,
  granularity: string,
  limit: number,
): CncfGeoTimeseriesResponse {
  const countries = [
    { country: 'United States', countryCode: 'US', flag: '🇺🇸' },
    { country: 'India', countryCode: 'IN', flag: '🇮🇳' },
    { country: 'China', countryCode: 'CN', flag: '🇨🇳' },
    { country: 'Germany', countryCode: 'DE', flag: '🇩🇪' },
    { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧' },
    { country: 'Canada', countryCode: 'CA', flag: '🇨🇦' },
    { country: 'France', countryCode: 'FR', flag: '🇫🇷' },
    { country: 'Japan', countryCode: 'JP', flag: '🇯🇵' },
    { country: 'Brazil', countryCode: 'BR', flag: '🇧🇷' },
    { country: 'Australia', countryCode: 'AU', flag: '🇦🇺' },
    { country: 'Other', countryCode: 'XX', flag: '🌍' },
  ].slice(0, limit + 1);

  const dates: string[] = [];
  let current = startDate.startOf(granularity === 'monthly' ? 'month' : 'quarter');

  while (current <= endDate) {
    dates.push(current.toFormat('yyyy-MM-dd'));
    current =
      granularity === 'monthly' ? current.plus({ months: 1 }) : current.plus({ quarters: 1 });
  }

  const data: GeoTimeseriesDataPoint[] = [];
  const baseContributors = [1200, 800, 600, 400, 350, 300, 280, 250, 200, 180, 500];

  dates.forEach((date, dateIndex) => {
    countries.forEach((countryInfo, countryIndex) => {
      const growth = 1 + dateIndex * 0.02;
      const variance = 0.9 + Math.random() * 0.2;
      const contributorCount = Math.round(
        (baseContributors[countryIndex] || 100) * growth * variance,
      );

      data.push({
        date,
        country: countryInfo.country,
        countryCode: countryInfo.countryCode,
        flag: countryInfo.flag,
        contributorCount,
      });
    });
  });

  const lastDateData = data.filter((d) => d.date === dates[dates.length - 1]);
  const totalContributors = lastDateData.reduce((sum, d) => sum + d.contributorCount, 0);
  const topCountry = lastDateData.reduce(
    (top, d) => (d.contributorCount > top.count ? { country: d.country, count: d.contributorCount } : top),
    { country: '', count: 0 },
  );

  return {
    summary: {
      totalContributors,
      totalCountries: 151, // Total countries with contributors (mock shows top 10 + Other)
      topCountry: topCountry.country,
      periodStart: startDate.toFormat('yyyy-MM-dd'),
      periodEnd: endDate.toFormat('yyyy-MM-dd'),
    },
    data,
  };
}
