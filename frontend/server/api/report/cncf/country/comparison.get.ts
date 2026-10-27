// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchCncfCountryComparison } from '~~/server/data/tinybird/report/cncf-country';
import {
  getComparisonRegion,
  parseCncfCountryFilter,
} from '~~/server/helpers/cncf-country.helpers';
import { logError } from '~~/server/utils/log';
import type { CncfCountryComparisonResponse } from '~~/types/report/cncf-country.types';

const VALID_GRANULARITIES = ['monthly', 'yearly'];

export default defineEventHandler(async (event): Promise<CncfCountryComparisonResponse> => {
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
    return await fetchCncfCountryComparison({
      ...filter,
      region: getComparisonRegion(filter.countryCode),
      granularity,
    });
  } catch (error: unknown) {
    logError('report/cncf/country/comparison', 'Failed to fetch CNCF country comparison', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch country comparison' });
  }
});
