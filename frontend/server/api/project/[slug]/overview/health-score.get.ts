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
    const healthScore: HealthScoreTinybird = data.reduce((mapped, scores) => ({
      ...mapped,
      ...scores,
    }), {} as HealthScoreTinybird)

      return {
          activeContributors: {
              benchmark: healthScore.activeContributorsBenchmark,
              value: healthScore.activeContributors,
          },
          contributorDependency: {
              value: healthScore.contributorDependencyCount,
              percentage: healthScore.contributorDependencyPercentage,
              benchmark: healthScore.contributorDependencyBenchmark,
          },
          organizationDependency: {
              value: healthScore.organizationDependencyCount,
              percentage: healthScore.organizationDependencyPercentage,
              benchmark: healthScore.organizationDependencyBenchmark,
          },
          retention: {
              value: healthScore.retentionRate,
              benchmark: healthScore.retentionBenchmark,
          },
          stars: {
              value: healthScore.stars,
              benchmark: healthScore.starsBenchmark,
          },
          forks: {
              value: healthScore.forks,
              benchmark: healthScore.forksBenchmark,
          },
          issuesResolution: {
              value: healthScore.issueResolution,
              benchmark: healthScore.issueResolutionBenchmark,
          },
          pullRequests: {
              value: healthScore.pullRequests,
              benchmark: healthScore.pullRequestsBenchmark,
          },
          mergeLeadTime: {
              value: healthScore.mergeLeadTime,
              benchmark: healthScore.mergeLeadTimeBenchmark,
          },
          activeDays: {
              value: healthScore.activeDaysCount,
              benchmark: healthScore.activeDaysBenchmark,
          },
          contributionsOutsideWorkHours: {
              value: healthScore.contributionsOutsideWorkHours,
              benchmark: healthScore.contributionsOutsideWorkHoursBenchmark,
          },
          searchQueries: {
              value: healthScore.searchVolumeAverage,
              benchmark: healthScore.searchVolumeBenchmark,
          },
      }

  } catch (error) {
    console.error('Error fetching active contributors:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch active contributors data',
      data: { message: error.message }
    });
  }
});
