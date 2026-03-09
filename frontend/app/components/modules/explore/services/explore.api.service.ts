// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { computed } from 'vue';
import type { QueryFunction } from '@tanstack/vue-query';
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';
import type { ExploreContributors } from '~~/types/explore/contributors';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Pagination } from '~~/types/shared/pagination';
import type { ExploreOrganizations } from '~~/types/explore/organizations';
import type { Project } from '~~/types/project';
import type { Collection } from '~~/types/collection';

class ExploreApiService {
  fetchTopContributors(pageSize: number) {
    const queryKey = computed(() => [TanstackKey.TOP_CONTRIBUTORS, pageSize]);

    const queryFn = computed<QueryFunction<ExploreContributors[]>>(() =>
      this.topContributorsQueryFn(() => ({
        pageSize,
      })),
    );

    return useQuery<ExploreContributors[]>({
      queryKey,
      queryFn,
    });
  }

  topContributorsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ExploreContributors[]> {
    const { pageSize } = query();
    return async () =>
      await $fetch(`/api/explore/contributors`, {
        params: {
          page: 0,
          pageSize,
        },
      });
  }
  fetchTopOrganizations(pageSize: number) {
    const queryKey = computed(() => [TanstackKey.TOP_ORGANIZATIONS, pageSize]);

    const queryFn = computed<QueryFunction<ExploreOrganizations[]>>(() =>
      this.topOrganizationsQueryFn(() => ({
        pageSize,
      })),
    );

    return useQuery<ExploreOrganizations[]>({
      queryKey,
      queryFn,
    });
  }

  topOrganizationsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ExploreOrganizations[]> {
    const { pageSize } = query();
    return async () =>
      await $fetch(`/api/explore/organizations`, {
        params: {
          page: 0,
          pageSize,
        },
      });
  }

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
