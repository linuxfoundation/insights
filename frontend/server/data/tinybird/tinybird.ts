// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { ofetch } from 'ofetch';
import { getBucketIdForProject } from './bucket-cache';

/**
 * Represents the structure of a response from the Tinybird API.
 *
 * @template T The type of the data returned in the response.
 *
 * @property {T} data The data returned by the query.
 * @property {Object[]} meta Metadata about the returned data fields.
 * @property {string} meta[].name The name of the field in the response.
 * @property {string} meta[].type The data type of the field in the response.
 * @property {number} rows The number of rows in the data response.
 * @property {number} rows_before_limit_at_least The number of rows available before any query limit was applied.
 * @property {Object} statistics Performance statistics for the query.
 * @property {number} statistics.elapsed Time in seconds it took to execute the query.
 * @property {number} statistics.rows_read Number of rows read during the query execution.
 * @property {number} statistics.bytes_read Number of bytes read during the query execution.
 */
export interface TinybirdResponse<T> {
  data: T;
  meta: {
    name: string;
    type: string;
  }[];
  rows: number;
  rows_before_limit_at_least: number;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

// TinyBird requires dates to be in a specific format, otherwise it returns an error.
/**
 * Formats a given DateTime object into a string compatible with TinyBird's expected date format.
 *
 * @param {DateTime} date - The DateTime object to be formatted.
 * @return {string} A string representing the formatted date in 'yyyy-MM-dd 00:00:00' format or an empty string if formatting fails.
 */
function formatDateForTinyBird(date: DateTime): string {
  return date.toFormat('yyyy-MM-dd 00:00:00') ?? '';
}

/**
 * Fetches data from Tinybird using the specified path and query parameters.
 *
 * @param {string} path - The API endpoint path to fetch data from.
 * @param {Record<string, string | number | boolean | string[] | DateTime | undefined | null>} query - The query parameters to be sent in the request. Values that are undefined, null, or empty are omitted. DateTime objects are formatted to a compatible string.
 * @return {Promise<TinybirdResponse<T>>} A promise that resolves to the response from Tinybird, containing the requested data.
 */
export async function fetchFromTinybird<T>(
  path: string,
  query: Record<string, string | number | boolean | string[] | DateTime | undefined | null>,
): Promise<TinybirdResponse<T>> {
  const tinybirdBaseUrl =
    process.env.NUXT_TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co';
  const tinybirdToken = process.env.NUXT_TINYBIRD_TOKEN;

  if (!tinybirdBaseUrl) {
    throw new Error('Tinybird base URL is not defined');
  }
  if (!tinybirdToken) {
    throw new Error('Tinybird token is not defined');
  }

  // Fetch and add bucketId if query contains a project parameter
  // Tinybird will route the request to the correct bucket that contains the data for that project
  if (
    query.project &&
    typeof query.project === 'string' &&
    !query.bucketId &&
    path !== '/v0/pipes/project_buckets.json'
  ) {
    try {
      const bucketId = await getBucketIdForProject(query.project, fetchFromTinybird);
      if (bucketId !== null) {
        query.bucketId = bucketId;
      }
    } catch (error) {
      console.error(`Failed to fetch bucketId for project ${query.project}:`, error);
      // Continue without bucketId
    }
  }

  // We don't want to send undefined, null, or empty values to TinyBird, so we remove those from the query.
  // We also format DateTime objects so that TinyBird understands them.
  const processedQuery = Object.fromEntries(
    Object.entries(query)
      .filter(
        ([_, value]) =>
          value !== undefined && value !== '' && value !== null && !Number.isNaN(value),
      )
      .map(([key, value]) => [
        key,
        value instanceof DateTime ? formatDateForTinyBird(value) : value,
      ])
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]),
  );

  const params = new URLSearchParams(processedQuery as Record<string, string>).toString();
  const url = params ? `${tinybirdBaseUrl}${path}?${params}` : `${tinybirdBaseUrl}${path}`;

  const data: TinybirdResponse<T> = await ofetch(url, {
    headers: {
      Authorization: `Bearer ${tinybirdToken}`,
    },
  });
  if (!data || !data.data) {
    throw new Error('Invalid response from Tinybird');
  }
  return data;
}

/**
 * Adds data to the specified Tinybird datasource.
 *
 * @param {string} datasource - The name of the Tinybird datasource where the data will be added.
 * @param {Record<string, string | number | boolean | string[] | DateTime | undefined | null>} data - The data to be added to the Tinybird datasource.
 * @return {Promise<boolean>} A promise that resolves to true if the data was successfully added.
 */
export async function addDataToTinybirdDatasource(
  datasource: string,
  data: object,
): Promise<boolean> {
  const tinybirdBaseUrl =
    process.env.NUXT_TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co';
  const tinybirdToken = process.env.NUXT_TINYBIRD_TOKEN;

  if (!tinybirdBaseUrl) {
    throw new Error('Tinybird base URL is not defined');
  }
  if (!tinybirdToken) {
    throw new Error('Tinybird token is not defined');
  }

  const url = `${tinybirdBaseUrl}/v0/events?name=${datasource}`;

  await ofetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tinybirdToken}`,
    },
    body: JSON.stringify(data),
  });
  return true;
}
