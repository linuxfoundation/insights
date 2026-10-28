// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchCncfCountryTimeseries } from '~~/server/data/tinybird/report/cncf-country';
import { parseCncfCountryFilter } from '~~/server/helpers/cncf-country.helpers';
import { logError } from '~~/server/utils/log';
import type { CncfCountryTimeseriesResponse } from '~~/types/report/cncf-country.types';

const VALID_GRANULARITIES = ['monthly', 'yearly'];

export default defineEventHandler(async (event): Promise<CncfCountryTimeseriesResponse> => {
  const query = getQuery(event);
  const filter = parseCncfCountryFilter(query);
  const granularity = (query.granularity as string) || 'monthly';

  if (!VALID_GRANULARITIES.includes(granularity)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid granularity: ${granularity}. Must be one of: ${VALID_GRANULARITIES.join(', ')}`,
    });
  }

  // generate_timeseries needs a start, and this report has no project to derive one from.
  if (!filter.startDate) {
    throw createError({ statusCode: 400, statusMessage: 'startDate is required' });
  }

  try {
    return await fetchCncfCountryTimeseries({ ...filter, granularity });
  } catch (error: unknown) {
    logError('report/cncf/country/timeseries', 'Failed to fetch CNCF country timeseries', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch country activity over time',
    });
  }
});
