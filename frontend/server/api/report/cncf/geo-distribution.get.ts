// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { fetchCollectionGeoDistribution } from '~~/server/data/tinybird/report/cncf-geo-distribution';
import type { CncfGeoDistributionResponse } from '~~/types/report/cncf.types';

export default defineEventHandler(async (event): Promise<CncfGeoDistributionResponse> => {
  const query = getQuery(event);

  const collection = (query.collection as string) || 'cncf';
  const startDate = query.startDate ? DateTime.fromISO(query.startDate as string) : undefined;
  const endDate = query.endDate ? DateTime.fromISO(query.endDate as string) : undefined;

  try {
    return await fetchCollectionGeoDistribution({
      collection,
      startDate,
      endDate,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Failed to fetch collection geo distribution:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch geographic distribution data',
    });
  }
});
