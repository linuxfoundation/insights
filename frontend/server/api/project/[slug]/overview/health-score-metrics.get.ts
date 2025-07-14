// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Query params:
 * - project: string
 * - repository: string
 */
import { DateTime } from 'luxon';

import type {HealthScoreTinybird} from '~~/types/overview/responses.types';
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";

interface HealthScoreFilters {
    project: string;
    repos?: string[];
    startDate?: DateTime;
    endDate?: DateTime;
}

const healthScores: string[] = [
    'active_contributors',
    'contributor_dependency',
    'organization_dependency',
    'retention',
    'stars',
    'forks',
    'issues_resolution',
    'pull_requests',
    'merge_lead_time',
    'active_days',
    'contributions_outside_work_hours',
    'search_volume',
]

const fetchHealthScore = async (name: string, filter: HealthScoreFilters) => {
  const res = await fetchFromTinybird<HealthScoreTinybird[]>(`/v0/pipes/health_score_${name}.json`, filter);
    if (!res.data || res.data.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' });
    }
    return res.data[0];
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: HealthScoreFilters = {
    project,
    repos,
  };

  if (query.startDate && (query.startDate as string).trim() !== '') {
    filter.startDate = DateTime.fromISO(query.startDate as string);
  }

  if (query.endDate && (query.endDate as string).trim() !== '') {
    filter.endDate = DateTime.fromISO(query.endDate as string);
  }

  try{

    const data = await Promise.all(
      healthScores.map(name => fetchHealthScore(name, filter))
    );
    return data.reduce((mapped, scores) => ({
      ...mapped,
      ...scores,
    }), {})

  } catch (error) {
    console.error('Error fetching active contributors:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch active contributors data',
      data: { message: error.message }
    });
  }
});
