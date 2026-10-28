// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchCncfCountrySummary } from '~~/server/data/tinybird/report/cncf-country';
import { parseCncfCountryFilter } from '~~/server/helpers/cncf-country.helpers';
import { logError } from '~~/server/utils/log';
import type { CncfCountrySummary } from '~~/types/report/cncf-country.types';

export default defineEventHandler(async (event): Promise<CncfCountrySummary> => {
  const filter = parseCncfCountryFilter(getQuery(event));

  try {
    return await fetchCncfCountrySummary(filter);
  } catch (error: unknown) {
    logError('report/cncf/country/summary', 'Failed to fetch CNCF country summary', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch country summary' });
  }
});
