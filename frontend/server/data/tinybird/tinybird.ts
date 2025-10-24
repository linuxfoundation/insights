// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { ofetch } from 'ofetch';

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
function formatDateForTinyBird(date: DateTime): string {
  return date.toFormat('yyyy-MM-dd 00:00:00') ?? '';
}

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

  // We don't want to send undefined, null, or empty values to TinyBird, so we remove those from the query.
  // We also format DateTime objects so that TinyBird understands them.
  const processedQuery = Object.fromEntries(
    Object.entries(query)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
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
