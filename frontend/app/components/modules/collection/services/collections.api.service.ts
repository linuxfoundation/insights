// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  type QueryFunction,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import type { Pagination } from '~~/types/shared/pagination';
import type { Collection } from '~~/types/collection';
import type { Category, CategoryGroup } from '~~/types/category';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { SearchProject, SearchResults } from '~~/types/search';

export interface CategoryGroupOptions {
  value: string;
  categories: Category[];
  id: string;
  name: string;
}

export interface QueryParams {
  pageSize: number;
  sort: string;
  categories: string | undefined;
}

export interface CategoryGroupsQueryParams {
  type: 'vertical' | 'horizontal';
  pageSize: number;
}

class CollectionsApiService {
  async prefetchCollections(params: ComputedRef<QueryParams>) {
    const queryClient = useQueryClient();
    const queryKey = computed(() => [
      TanstackKey.COLLECTIONS,
      params.value.sort,
      params.value.categories,
    ]);

    const queryFn = this.fetchCollectionsQueryFn(() => ({
      ...params.value,
    }));

    return await queryClient.prefetchInfiniteQuery<
      Pagination<Collection>,
      Error,
      Pagination<Collection>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      initialPageParam: 0,
      getNextPageParam: this.getNextPageCollectionsParam,
    });
  }

  getNextPageCollectionsParam(lastPage: Pagination<Collection>) {
    const nextPage = lastPage.page + 1;
    const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
    return nextPage < totalPages ? nextPage : null;
  }

  fetchCollections(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.COLLECTIONS,
      params.value.sort,
      params.value.categories,
      params.value.pageSize,
    ]);

    const queryFn = this.fetchCollectionsQueryFn(() => ({
      ...params.value,
    }));

    return useInfiniteQuery<
      Pagination<Collection>,
      Error,
      Pagination<Collection>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      getNextPageParam: this.getNextPageCollectionsParam,
      initialPageParam: 0,
    });
  }

  searchCollections(query: string) {
    return $fetch(`/api/collection`, {
      params: {
        page: 0,
        pageSize: 100,
        search: query,
        sort: 'starred_desc',
      },
    });
  }

  fetchCollectionsQueryFn(
    query: () => Record<string, string | number | string[] | undefined>,
  ): QueryFunction<Pagination<Collection>, readonly unknown[], number> {
    return async ({ pageParam = 0 }) =>
      await $fetch('/api/collection', {
        params: {
          page: pageParam,
          ...query(),
        },
      });
  }

  fetchCollection(slug: string): QueryFunction<Collection> {
    return () => $fetch(`/api/collection/${slug}`);
  }

  fetchCategoryGroups(params: ComputedRef<CategoryGroupsQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CATEGORY_GROUPS,
      params.value.type,
      params.value.pageSize,
    ]);

    const queryFn = computed<QueryFunction<Pagination<CategoryGroup>>>(() =>
      this.fetchCategoryGroupsQueryFn(() => ({
        ...params.value,
      })),
    );

    return useQuery<Pagination<CategoryGroup>, Error>({
      queryKey,
      queryFn,
    });
  }

  fetchCategoryGroupsQueryFn(
    query: () => Record<string, string | number>,
  ): QueryFunction<Pagination<CategoryGroup>> {
    return () =>
      $fetch(`/api/category`, {
        params: query(),
      });
  }

  async searchProjects(query: string): Promise<SearchProject[]> {
    if (!query || query.length === 0) {
      return [];
    }

    try {
      const res = await $fetch<SearchResults>('/api/search', {
        query: { query },
      });

      return res.projects || [];
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }
}

export const COLLECTIONS_API_SERVICE = new CollectionsApiService();
