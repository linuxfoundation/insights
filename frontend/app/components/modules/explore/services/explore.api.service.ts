// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { computed } from 'vue';
import type { QueryFunction } from '@tanstack/vue-query';
import { useInfiniteQuery } from '@tanstack/vue-query';
import type { ExploreContributors } from '~~/types/explore/contributors';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Pagination } from '~~/types/shared/pagination';

class ExploreApiService {
  fetchTopContributors() {
    const queryKey = computed(() => [TanstackKey.TOP_CONTRIBUTORS]);

    const queryFn = computed<QueryFunction<Pagination<ExploreContributors>>>(() => this.topContributorsQueryFn());

    return useInfiniteQuery<Pagination<ExploreContributors>>({
      queryKey,
      // TODO: fix this type error
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        console.log(lastPage);
        const nextPage = lastPage.page + 1;
        const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
        return nextPage < totalPages ? nextPage : undefined;
      },
    });
  }

  topContributorsQueryFn(): QueryFunction<Pagination<ExploreContributors>> {
    // const { projectSlug, platform, activityType, repository, startDate, endDate } = query();
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number;

      return await $fetch(`/api/explore/contributors`, {
        params: {
          page: pageParam,
          pageSize: 10,
        },
      });
    };
  }
}

export const EXPLORE_API_SERVICE = new ExploreApiService();
