/*
This is responsible for fetching the active contributors data from Tinybird.
The goal is to make the API endpoint oblivious to where the data comes from, since it's a separate service.
There's a bit of an overlap in responsibility between the API and this service because this returns the data
in the format the API will return to the client, which isn't ideal. If we ever need to use this for something else,
let's refactor it to return the data in a more generic format.
 */

import type {
  ActiveContributorsResponse,
  ActiveContributorsResponseData,
  ActiveContributorsFilter,
} from "../types";
import type {ContributorsDataSource} from "../active-contributors-data-source";
import {getPreviousDates} from "../util";
import type {TinybirdResponse} from './tinybird';
import {fetchFromTinybird} from './tinybird'

type TinybirdContributorsSummary = {
  contributorCount: number;
}[];

type TinybirdContributorsData = {
  startDate: string;
  endDate: string;
  contributorCount: number;
}[];

async function fetchActiveContributors(filter: ActiveContributorsFilter) {
  const dates = getPreviousDates(filter.startDate, filter.endDate);

  const currentSummaryQuery = {
    project: filter.project,
    repo: filter.repo,
    startDate: dates.current.from,
    endDate: dates.current.to
  };

  const previousSummaryQuery = {
    project: filter.project,
    repo: filter.repo,
    startDate: dates.previous.from,
    endDate: dates.previous.to
  };

  const dataQuery = {
    project: filter.project,
    granularity: filter.granularity,
    repo: filter.repo,
    startDate: dates.current.from,
    endDate: dates.current.to
  };

  const [currentSummary, previousSummary, data] = await Promise.all([
    fetchFromTinybird<TinybirdContributorsSummary>('/v0/pipes/active_contributors.json', currentSummaryQuery),
    fetchFromTinybird<TinybirdContributorsSummary>('/v0/pipes/active_contributors.json', previousSummaryQuery),
    fetchFromTinybird<TinybirdContributorsData>('/v0/pipes/active_contributors.json', dataQuery)
  ]);

  let processedData: ActiveContributorsResponseData = [];
  if (data !== undefined) {
    processedData = (data as TinybirdResponse<TinybirdContributorsData>)?.data.map(
      (item): ActiveContributorsResponseData[0] => ({
        startDate: item.startDate,
        endDate: item.endDate,
        contributors: item.contributorCount
      })
    );
  }

  const currentContributorCount = currentSummary.data[0].contributorCount;
  const previousContributorCount = previousSummary.data[0].contributorCount;
  const changeValue = currentContributorCount - previousContributorCount;
  let percentageChange = 0;
  if (previousContributorCount === 0 && currentContributorCount > 0) {
    percentageChange = 100;
  } else if (previousContributorCount === 0 && currentContributorCount === 0) {
    percentageChange = 0;
  } else if (previousContributorCount !== 0) {
    percentageChange = ((currentContributorCount - previousContributorCount) / previousContributorCount) * 100;
  }

  const response: ActiveContributorsResponse = {
    summary: {
      current: currentContributorCount,
      previous: previousContributorCount,
      percentageChange,
      changeValue,
      periodFrom: dates.current.from,
      periodTo: dates.current.to,
    },
    data: processedData,
  };

  return response;
}

export function createTinybirdDataSource(): ContributorsDataSource {
  return {
    fetchActiveContributors
  };
}
