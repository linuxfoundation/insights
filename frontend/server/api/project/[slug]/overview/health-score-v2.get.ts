// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ProjectInsightsTinybird } from '~~/types/project';
import type { HealthScoreV2Results } from '~~/types/overview/responses.types';

export default defineEventHandler(async (event): Promise<HealthScoreV2Results> => {
  const slug = (event.context.params as { slug: string }).slug;

  try {
    const res = await fetchFromTinybird<ProjectInsightsTinybird[]>(
      '/v0/pipes/project_insights.json',
      {
        slug,
      },
    );
    if (!res.data || res.data.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' });
    }
    const { healthScoreV2, healthLabel, lifecycleLabel, impactScore, impactLabel } = res.data[0];
    return { healthScoreV2, healthLabel, lifecycleLabel, impactScore, impactLabel };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error;
    }
    console.error('Error fetching health score v2:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score v2',
    });
  }
});
