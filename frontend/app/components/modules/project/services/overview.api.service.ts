// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { HealthScore, HealthScoreResults } from '~~/types/overview/responses.types';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Organization } from '~~/types/contributors/responses.types';
import { benchmarkConfigs } from '~~/app/config/benchmarks';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export interface OverviewQueryParams {
  projectSlug: string;
  repos?: string[];
}

export interface ScoreDataQueryParams extends OverviewQueryParams {
  type: string;
}

// TODO: Refactor other services to follow this pattern
class OverviewApiService {
  fetchHealthScoreOverview(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.HEALTH_SCORE_OVERVIEW,
      params.value.projectSlug,
      params.value.repos
    ]);
    const queryFn = computed<QueryFunction<HealthScoreResults>>(() => this.healthScoreOverviewQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos
      })));

    return useQuery<HealthScoreResults>({
      queryKey,
      queryFn
    });
  }
  
  healthScoreOverviewQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<HealthScoreResults> {
    const { projectSlug, repos } = query();
    return async () => await $fetch(`/api/project/${projectSlug}/overview/health-score-overview`, {
        params: {
          repos
        }
      });
  }

  fetchAssociatedOrganization(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ASSOCIATED_ORGANIZATION,
      params.value.projectSlug
    ]);
    const queryFn = computed<QueryFunction<Organization>>(() => this.associatedOrganizationQueryFn(() => ({
        projectSlug: params.value.projectSlug
      })));

    return useQuery<Organization>({
      queryKey,
      queryFn
    });
  }

  associatedOrganizationQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<Organization> {
    const { projectSlug } = query();

    return async () => await $fetch(`/api/project/${projectSlug}/overview/associated-organization`, {
        params: {
          projectSlug
        }
      });
  }

  convertRawResultsToHealthScore(rawValues: HealthScoreResults): HealthScore[] {
    return [
      {
        key: BenchmarkKeys.Retention,
        value: rawValues.retentionRate,
        points: rawValues.retentionBenchmark
      },
      {
        key: BenchmarkKeys.ActiveContributors,
        value: rawValues.activeContributors,
        points: rawValues.activeContributorsBenchmark
      },
      {
        key: BenchmarkKeys.ContributorDependency,
        value: rawValues.contributorDependencyCount,
        points: rawValues.contributorDependencyBenchmark
      },
      {
        key: BenchmarkKeys.OrganizationDependency,
        value: rawValues.organizationDependencyCount,
        points: rawValues.organizationDependencyBenchmark
      },
      {
        key: BenchmarkKeys.Stars,
        value: rawValues.stars,
        points: rawValues.starsBenchmark
      },
      {
        key: BenchmarkKeys.Forks,
        value: rawValues.forks,
        points: rawValues.forksBenchmark
      },
      {
        key: BenchmarkKeys.SearchQueries,
        value: rawValues.searchVolumeAverage,
        points: rawValues.searchVolumeBenchmark
      },
      {
        key: BenchmarkKeys.IssuesResolution,
        value: rawValues.issueResolution,
        points: rawValues.issueResolutionBenchmark
      },
      {
        key: BenchmarkKeys.PullRequests,
        value: rawValues.pullRequests,
        points: rawValues.pullRequestsBenchmark
      },
      {
        key: BenchmarkKeys.ActiveDays,
        value: rawValues.activeDaysCount,
        points: rawValues.activeDaysBenchmark
      },
      {
        key: BenchmarkKeys.MergeLeadTime,
        value: rawValues.mergeLeadTime,
        points: rawValues.mergeLeadTimeBenchmark
      },
      {
        key: BenchmarkKeys.ContributionsOutsideWorkHours,
        value: rawValues.contributionsOutsideWorkHours,
        points: rawValues.contributionsOutsideWorkHoursBenchmark
      }
    ]
  }

  getPointDetails(value: number, key: BenchmarkKeys) {
    const benchmarkConfig = benchmarkConfigs.find((config) => config.key === key);
    return benchmarkConfig?.points.find(
      (point) => point.pointStart <= value && (point.pointEnd === null || point.pointEnd >= value)
    );
  }

  getBenchmarkTitle(key: BenchmarkKeys) {
    const benchmarkConfig = benchmarkConfigs.find((config) => config.key === key);
    return benchmarkConfig?.title;
  }
}

export const OVERVIEW_API_SERVICE = new OverviewApiService();
