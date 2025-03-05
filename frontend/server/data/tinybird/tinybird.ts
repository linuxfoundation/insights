import type {DateTime} from "luxon";
import type {ActiveContributorsFilter, ContributorsFilterGranularity} from "../types";
import {useRuntimeConfig} from '#imports';

type FetchFunction = typeof $fetch;

/*
 * These are the query parameters that are sent to TinyBird.
 * It is pretty much the same as the ActiveContributorsFilter, but
 * with the dates formatted as strings appropriate for Tinybird.
 */
export type TinybirdActiveContributorsQueryParams = {
  project: string;
  repo?: string;
  granularity?: ContributorsFilterGranularity;
  toDate?: string;
  fromDate?: string;
}

/*
This is the summary response from Tinybird when we query for active contributors.
The summary doesn't contain timeseries data, just the total number of active contributors.
 */
export type TinybirdContributorsSummaryResponse = {
  meta: [
    {
      name: string,
      type: string
    }[],
  ],
  data:
    {
      contributorCount: number;
    }[],
  rows: number,
  statistics: {
    elapsed: number,
    rows_read: number,
    bytes_read: number
  }
}

/*
This is the response from Tinybird when we query for active contributors with a granularity.
The data contains timeseries data, with the number of active contributors for each period.
 */
export type TinybirdContributorsDataResponse = {
  meta: [
    {
      name: string,
      type: string
    }[],
  ],
  data:
    {
      fromDate: string;
      toDate: string;
      contributorCount: number;
    }[],
  rows: number,
  statistics: {
    elapsed: number,
    rows_read: number,
    bytes_read: number
  }
}

export type TinybirdContributorsResponse = TinybirdContributorsDataResponse | TinybirdContributorsSummaryResponse

export function formatDateForTinyBird(date: DateTime): string {
  return date.toISODate() ?? '';
}

export async function fetchFromTinybird(
  endpoint: string,
  query: ActiveContributorsFilter,
  fetchFn: FetchFunction = $fetch
): Promise<TinybirdContributorsResponse> {
  const config = useRuntimeConfig();

  if (!config.tinybirdBaseUrl) {
    throw new Error('Tinybird base URL is not defined');
  }
  if (!config.tinybirdToken) {
    throw new Error('Tinybird token is not defined');
  }

  const url = `${config.tinybirdBaseUrl}${endpoint}`;

  // We don't want to send parameters to Tinybird that are empty. Plus, we need to format the dates for Tinybird.
  const {
    project, granularity, repo, fromDate, toDate
  } = query;
  const tinybirdQuery: TinybirdActiveContributorsQueryParams = {
    project,
    ...(granularity && { granularity }),
    ...(repo && { repo }),
    ...(fromDate && { fromDate: formatDateForTinyBird(fromDate) }),
    ...(toDate && { toDate: formatDateForTinyBird(toDate) })
  };

  // if (query.repo) tinybirdQuery.repo = 'https://gerrit.automotivelinux.org/gerrit/q/project:apps/homescreen';

  const result = await fetchFn(url.toString(), {
    query: tinybirdQuery,
    headers: {
      Authorization: `Bearer ${config.tinybirdToken}`
    }
  });

  // TODO: this isn't scalable, we will have many other request types, and thus many other response types.
  // Could we specify the response type in the function signature?
  if (query.granularity) {
    return result as TinybirdContributorsDataResponse;
  }

  return result as TinybirdContributorsSummaryResponse;
}
