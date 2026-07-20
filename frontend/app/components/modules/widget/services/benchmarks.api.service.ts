// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { HealthScoreResults } from '~~/types/overview/responses.types';
import { TanstackKey } from '~/components/shared/types/tanstack';

export interface BenchmarksQueryParams {
  projectSlug: string;
  repos?: string[];
  startDate: string | null;
  endDate: string | null;
}

// TODO: Refactor other services to follow this pattern
class BenchmarksApiService {
  // enabled defaults to true - benchmarks are a per-project health-score concept with no
  // collection equivalent (health-score/overview routes are out of scope for collections),
  // so collection pages pass enabled: false to skip this query entirely.
  fetchWidgetBenchmarks(
    params: ComputedRef<BenchmarksQueryParams>,
    enabled: ComputedRef<boolean> | boolean = true,
  ) {
    const queryKey = computed(() => [
      TanstackKey.HEALTH_SCORE,
      params.value.projectSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<HealthScoreResults>>(() =>
      this.widgetBenchmarksQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<HealthScoreResults>({
      queryKey,
      queryFn,
      enabled,
    });
  }

  widgetBenchmarksQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<HealthScoreResults> {
    const { projectSlug, repos, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/overview/health-score`, {
        params: {
          repos,
          startDate,
          endDate,
        },
      });
  }
}

export const BENCHMARKS_API_SERVICE = new BenchmarksApiService();
