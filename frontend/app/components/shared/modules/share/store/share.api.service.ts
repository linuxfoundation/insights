// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { ActiveContributors } from '~~/types/contributors/responses.types';
import { Granularity } from '~~/types/shared/granularity';

export interface ActiveContributorsQueryParams {
  projectSlug: string;
  repos?: string[];
  startDate: string;
  endDate: string;
}

class ShareApiService {
  fetchActiveContributors(params: ComputedRef<ActiveContributorsQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ACTIVE_CONTRIBUTORS,
      params.value.projectSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate
    ]);
    const queryFn = computed<QueryFunction<ActiveContributors>>(() => this.activeContributorsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate
      })));

    return useQuery<ActiveContributors>({
      queryKey,
      queryFn
    });
  }

  activeContributorsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<ActiveContributors> {
    const {
 projectSlug, repos, startDate, endDate
} = query();
    return async () => await $fetch(`/api/project/${projectSlug}/contributors/active-contributors`, {
        params: {
          granularity: Granularity.WEEKLY,
          repos,
          startDate,
          endDate
        }
      });
  }
}

export const SHARE_API_SERVICE = new ShareApiService();
