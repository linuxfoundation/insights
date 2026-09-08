// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ImpactBreakdownResults } from '~~/types/overview/responses.types';

export default defineEventHandler(async (event): Promise<ImpactBreakdownResults> => {
  const slug = (event.context.params as { slug: string }).slug;

  try {
    const res = await fetchFromTinybird<ImpactBreakdownResults[]>(
      '/v0/pipes/project_insights_impact_breakdown.json',
      {
        slug,
      },
    );
    if (!res.data || res.data.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' });
    }
    return res.data[0];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error;
    }
    console.error('Error fetching health score impact breakdown:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score impact breakdown',
    });
  }
});
