import type {GeographicDistributionFilter} from "../types";
import { GeographicDistributionType} from "../types";
import {fetchFromTinybird, type TinybirdResponse} from './tinybird'

// This is one data point in the response
export type GeographicDistributionDataPoint = {
  name: string; // Country Name
  code: string; // country code
  flag: string; // flag url
  count: number; // count of contributors or organizations in that country
  percentage: number; // percentage of the contribution based on the total
};

// This is the response this function returns
export type GeographicDistributionResponse = {
  summary: {
    totalContributions: number;
    // startDate: DateTime;
    // endDate: DateTime;
  },
  data: GeographicDistributionDataPoint[]
};

// This is the data part of the response from Tinybird
type TinybirdGeographicDistributionData = {
  country: string,
  flag: string,
  country_code: string,
  contributorCount?: number,
  contributorPercentage?: number,
  organizationCount?: number,
  organizationPercentage?: number,
}[];

export async function fetchGeographicDistribution(filter: GeographicDistributionFilter) {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const queryType = filter?.type as GeographicDistributionType || GeographicDistributionType.CONTRIBUTORS;

  // Default to contributors data and use organizations data if that type is set in the query.
  let path = 'contributors_geo_distribution.json';
  if (queryType === GeographicDistributionType.ORGANIZATIONS) {
    path = 'organizations_geo_distribution.json';
  }

  const data = await fetchFromTinybird<TinybirdGeographicDistributionData>(
    `/v0/pipes/${path}`,
    filter
  );

  const processedData: GeographicDistributionDataPoint[] = (data as TinybirdResponse<TinybirdGeographicDistributionData>)?.data.map(
    (item): GeographicDistributionDataPoint => ({
      name: item.country,
      code: item.country_code,
      flag: item.flag,
      count: (queryType === GeographicDistributionType.CONTRIBUTORS ? item.contributorCount : item.organizationCount) as number,
      percentage: (queryType === GeographicDistributionType.CONTRIBUTORS ? item.contributorPercentage : item.organizationPercentage) as number,
    })
  );

  const response: GeographicDistributionResponse = {
    summary: {
      totalContributions: 0,
      // startDate: filter.startDate,
      // endDate: filter.endDate,
    },
    data: processedData
  };

  return response;
}
