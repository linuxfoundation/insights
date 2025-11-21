// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Query params:
 * - project: string
 * - repos: string[]
 */
import { DateTime } from 'luxon';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { HealthScoreTinybird, HealthScoreResults } from '~~/types/overview/responses.types';
import {
  createHealthScoreSchema,
  fetchHealthScoreMetrics,
} from '~~/server/helpers/health-score.helpers';

export default defineEventHandler(async (event): Promise<HealthScoreResults | unknown> => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter = {
    project,
    repos,
  };

  try {
    let healthScore;
    if (!repos || repos.length === 0) {
      const res = await fetchFromTinybird<HealthScoreTinybird[]>(
        '/v0/pipes/health_score_overview.json',
        filter,
      );
      if (!res.data || res.data.length === 0) {
        return createError({ statusCode: 404, statusMessage: 'Not found' });
      }
      healthScore = res.data[0];
    } else {
      healthScore = await fetchHealthScoreMetrics({
        project,
        repos,
      });
    }

    return createHealthScoreSchema(healthScore);
  } catch (error) {
    console.error('Error fetching health score:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score',
    });
  }
});
