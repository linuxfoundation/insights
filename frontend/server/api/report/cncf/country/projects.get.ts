// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchCncfCountryProjects } from '~~/server/data/tinybird/report/cncf-country';
import { parseCncfCountryFilter, parseLimit } from '~~/server/helpers/cncf-country.helpers';
import { logError } from '~~/server/utils/log';
import type { CncfCountryProjectsResponse } from '~~/types/report/cncf-country.types';

export default defineEventHandler(async (event): Promise<CncfCountryProjectsResponse> => {
  const query = getQuery(event);
  const filter = parseCncfCountryFilter(query);

  try {
    return await fetchCncfCountryProjects({ ...filter, limit: parseLimit(query.limit, 10) });
  } catch (error: unknown) {
    logError('report/cncf/country/projects', 'Failed to fetch CNCF country projects', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch country projects' });
  }
});
