// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchCncfCountryOrganizations } from '~~/server/data/tinybird/report/cncf-country';
import { parseCncfCountryFilter, parseLimit } from '~~/server/helpers/cncf-country.helpers';
import { logError } from '~~/server/utils/log';
import type { CncfCountryOrganizationsResponse } from '~~/types/report/cncf-country.types';

export default defineEventHandler(async (event): Promise<CncfCountryOrganizationsResponse> => {
  const query = getQuery(event);
  const filter = parseCncfCountryFilter(query);

  try {
    return await fetchCncfCountryOrganizations({ ...filter, limit: parseLimit(query.limit, 10) });
  } catch (error: unknown) {
    logError(
      'report/cncf/country/organizations',
      'Failed to fetch CNCF country organizations',
      error,
    );
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch country organizations' });
  }
});
