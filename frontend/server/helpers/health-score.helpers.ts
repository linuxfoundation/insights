// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { HealthScoreResults, HealthScoreTinybird } from '~~/types/overview/responses.types';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

export interface HealthScoreFilters {
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
  'security',
];

const quarterMetrics = ['active_contributors', 'retention'];
const yearlyMetrics = [
  'contributor_dependency',
  'organization_dependency',
  'issues_resolution',
  'pull_requests',
  'merge_lead_time',
  'active_days',
  'contributions_outside_work_hours',
  'search_volume',
];

const fetchHealthScore = async (name: string, filter: HealthScoreFilters) => {
  const now = DateTime.now();
  const currentQuarterStart = DateTime.fromObject({
    year: now.year,
    month: (now.quarter - 1) * 3 + 1,
    day: 1,
  }).startOf('day');
  const lastQuarterStart = currentQuarterStart.minus({ months: 3 });

  const quarterFilter = {
    project: filter.project,
    repos: filter.repos,
    startDate: lastQuarterStart,
    endDate: currentQuarterStart,
  };

  const yearlyFilter = {
    project: filter.project,
    repos: filter.repos,
    startDate: filter.startDate ?? DateTime.now().minus({ days: 365 }).startOf('day'),
    endDate: filter.endDate ?? DateTime.now().plus({ days: 1 }).startOf('day'),
  };

  let effectiveFilter: HealthScoreFilters;
  if (quarterMetrics.includes(name)) {
    effectiveFilter = quarterFilter;
  } else if (yearlyMetrics.includes(name)) {
    effectiveFilter = yearlyFilter;
  } else {
    effectiveFilter = filter;
  }

  const res = await fetchFromTinybird<HealthScoreTinybird[]>(
    `/v0/pipes/health_score_${name}.json`,
    effectiveFilter,
  );
  return res.data?.[0];
};

const MAX_BENCHMARK_SCORE = 5;

function calculatePercentage(benchmarks: number[]): number {
  const sum = benchmarks.reduce((a, b) => a + b, 0);
  const max = benchmarks.length * MAX_BENCHMARK_SCORE;
  return max > 0 ? Math.round((sum / max) * 100) : 0;
}

function calculateCategoryPercentages(healthScore: HealthScoreTinybird): HealthScoreTinybird {
  const contributorPercentage = calculatePercentage([
    healthScore.activeContributorsBenchmark || 0,
    healthScore.contributorDependencyBenchmark || 0,
    healthScore.organizationDependencyBenchmark || 0,
    healthScore.retentionBenchmark || 0,
  ]);

  const popularityPercentage = calculatePercentage([
    healthScore.starsBenchmark || 0,
    healthScore.forksBenchmark || 0,
    healthScore.searchVolumeBenchmark || 0,
  ]);

  const developmentPercentage = calculatePercentage([
    healthScore.issueResolutionBenchmark || 0,
    healthScore.pullRequestsBenchmark || 0,
    healthScore.mergeLeadTimeBenchmark || 0,
    healthScore.activeDaysBenchmark || 0,
    healthScore.contributionsOutsideWorkHoursBenchmark || 0,
  ]);

  const securityPercentage = healthScore.securityPercentage || 0;

  const categories = [
    contributorPercentage,
    popularityPercentage,
    developmentPercentage,
    securityPercentage,
  ];
  const overallScore = Math.round(categories.reduce((a, b) => a + b, 0) / categories.length);

  return {
    ...healthScore,
    contributorPercentage,
    popularityPercentage,
    developmentPercentage,
    securityPercentage,
    overallScore,
  };
}

export const fetchHealthScoreMetrics = async (
  filter: HealthScoreFilters,
): Promise<HealthScoreTinybird> => {
  const data = await Promise.all(healthScores.map((name) => fetchHealthScore(name, filter)));
  const merged = data.reduce(
    (mapped, scores) => ({
      ...mapped,
      ...scores,
    }),
    {} as HealthScoreTinybird,
  );

  return calculateCategoryPercentages(merged);
};

export function createHealthScoreSchema(healthScore: HealthScoreTinybird): HealthScoreResults {
  return {
    activeContributors: {
      benchmark: healthScore.activeContributorsBenchmark || 0,
      value: healthScore.activeContributors || 0,
    },
    contributorDependency: {
      value: healthScore.contributorDependencyCount || 0,
      percentage: healthScore.contributorDependencyPercentage || 0,
      benchmark: healthScore.contributorDependencyBenchmark || 0,
    },
    organizationDependency: {
      value: healthScore.organizationDependencyCount || 0,
      percentage: healthScore.organizationDependencyPercentage || 0,
      benchmark: healthScore.organizationDependencyBenchmark || 0,
    },
    retention: {
      value: healthScore.retentionRate || 0,
      benchmark: healthScore.retentionBenchmark || 0,
    },
    stars: {
      value: healthScore.stars || 0,
      benchmark: healthScore.starsBenchmark || 0,
    },
    forks: {
      value: healthScore.forks || 0,
      benchmark: healthScore.forksBenchmark || 0,
    },
    issuesResolution: {
      value: healthScore.issueResolution || 0,
      benchmark: healthScore.issueResolutionBenchmark || 0,
    },
    pullRequests: {
      value: healthScore.pullRequests || 0,
      benchmark: healthScore.pullRequestsBenchmark || 0,
    },
    mergeLeadTime: {
      value: healthScore.mergeLeadTime || 0,
      benchmark: healthScore.mergeLeadTimeBenchmark || 0,
    },
    activeDays: {
      value: healthScore.activeDaysCount || 0,
      benchmark: healthScore.activeDaysBenchmark || 0,
    },
    contributionsOutsideWorkHours: {
      value: healthScore.contributionsOutsideWorkHours || 0,
      benchmark: healthScore.contributionsOutsideWorkHoursBenchmark || 0,
    },
    searchQueries: {
      value: healthScore.searchVolumeAverage || 0,
      benchmark: healthScore.searchVolumeBenchmark || 0,
    },
    securityCategoryPercentage: (healthScore.securityCategoryPercentage || []).map((score) => {
      const [category, percentage] = score;
      return {
        category,
        percentage,
      };
    }),
    contributorPercentage: healthScore.contributorPercentage || 0,
    popularityPercentage: healthScore.popularityPercentage || 0,
    developmentPercentage: healthScore.developmentPercentage || 0,
    securityPercentage: healthScore.securityPercentage || 0,
    overallScore: healthScore.overallScore || 0,
  };
}
