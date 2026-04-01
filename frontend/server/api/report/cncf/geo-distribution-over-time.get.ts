// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { fetchCollectionGeoDistributionOverTime } from '~~/server/data/tinybird/report/cncf-geo-distribution';
import type { CncfGeoDistributionOverTimeResponse } from '~~/types/report/cncf.types';

const VALID_GRANULARITIES = ['monthly', 'yearly'];

export default defineEventHandler(async (event): Promise<CncfGeoDistributionOverTimeResponse> => {
  const query = getQuery(event);

  const collection = (query.collection as string) || 'cncf';
  const granularity = (query.granularity as string) || 'monthly';
  const startDate = query.startDate ? DateTime.fromISO(query.startDate as string) : undefined;
  const endDate = query.endDate ? DateTime.fromISO(query.endDate as string) : undefined;

  if (!VALID_GRANULARITIES.includes(granularity)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid granularity: ${granularity}. Must be one of: ${VALID_GRANULARITIES.join(', ')}`,
    });
  }

  try {
    return await fetchCollectionGeoDistributionOverTime({
      collection,
      granularity,
      startDate,
      endDate,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Failed to fetch collection geo distribution over time:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch geographic distribution data',
    });
  }
});
