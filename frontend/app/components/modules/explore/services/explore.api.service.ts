// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Collection } from '~~/types/collection';
import type { Project } from '~~/types/project';
import type { Pagination } from '~~/types/shared/pagination';

class ExploreApiService {
  fetchTopProjects(pageSize: number) {
    const queryKey = computed(() => [TanstackKey.TOP_PROJECTS, pageSize]);

    const queryFn = computed<QueryFunction<Pagination<Project>>>(() =>
      this.topProjectsQueryFn(() => ({
        pageSize,
      })),
    );

    return useInfiniteQuery<Pagination<Project>>({
      queryKey,
      // TODO: fix this type error
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;
        const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
        return nextPage < totalPages ? nextPage : undefined;
      },
    });
  }

  topProjectsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<Pagination<Project>> {
    const { pageSize } = query();
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number;

      // TODO: verify what the sort should be here
      return await $fetch(`/api/project`, {
        params: {
          page: pageParam,
          pageSize,
          sort: 'contributorCount_desc',
          onboarded: true, // Only fetch onboarded projects
          isLF: true, // Only fetch LF projects
        },
      });
    };
  }

  fetchFeaturedCollections() {
    const sort = 'starred_desc';
    const pageSize = 3;
    const queryKey = computed(() => [TanstackKey.COLLECTIONS, sort, pageSize]);

    const queryFn = computed<QueryFunction<Pagination<Collection>>>(() =>
      this.featuredCollectionsQueryFn(() => ({
        pageSize,
        sort,
      })),
    );

    return useQuery<Pagination<Collection>>({
      queryKey,
      queryFn,
    });
  }

  featuredCollectionsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<Pagination<Collection>> {
    return async () =>
      await $fetch('/api/collection', {
        params: {
          page: 0,
          ...query(),
        },
      });
  }
}

export const EXPLORE_API_SERVICE = new ExploreApiService();
