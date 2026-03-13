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
import type { Collection, CollectionType } from '~~/types/collection';
import type { Category, CategoryGroup } from '~~/types/category';
import type { ProjectInsights } from '~~/types/project';
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
  type?: CollectionType;
  search?: string;
  page?: number;
}

export interface CategoryGroupsQueryParams {
  type: 'vertical' | 'horizontal';
  pageSize: number;
}

export interface CollectionPayload {
  name: string;
  description?: string;
  isPrivate?: boolean;
  projects?: string[];
}

export interface CollectionProjectsQueryParams {
  slug: string;
  sort?: string;
  isLF?: boolean;
  page?: number;
  pageSize?: number;
}

const MAX_SEARCH_QUERY_LENGTH = 200;
const MIN_SEARCH_QUERY_LENGTH = 1;

function sanitizeSearchQuery(query: string): string | null {
  if (!query || typeof query !== 'string') {
    return null;
  }

  const sanitized = query.trim().slice(0, MAX_SEARCH_QUERY_LENGTH).replace(/[<>]/g, '');

  if (sanitized.length < MIN_SEARCH_QUERY_LENGTH) {
    return null;
  }

  return sanitized;
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
      params.value.type,
      params.value.search,
      params.value.page,
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
    const sanitizedQuery = sanitizeSearchQuery(query);
    if (!sanitizedQuery) {
      return Promise.resolve({ data: [], total: 0, page: 0, pageSize: 100 });
    }

    return $fetch(`/api/collection`, {
      params: {
        page: 0,
        pageSize: 100,
        search: sanitizedQuery,
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
    const sanitizedQuery = sanitizeSearchQuery(query);
    if (!sanitizedQuery) {
      return [];
    }

    const res = await $fetch<SearchResults>('/api/search', {
      query: { query: sanitizedQuery },
    });

    return res.projects || [];
  }

  discoveryParams(type: CollectionType) {
    return {
      pageSize: 3,
      sort: 'contributors_desc',
      type,
      categories: undefined,
    };
  }

  fetchDiscoveryCuratedCollections() {
    const queryKey = computed(() => [TanstackKey.COLLECTION_DISCOVERY, 'curated']);
    const queryFn = this.fetchCollectionsQueryFn(() => this.discoveryParams('curated'));

    return useQuery<Pagination<Collection>>({
      queryKey,
      queryFn,
    });
  }

  fetchDiscoveryCommunityCollections() {
    const queryKey = computed(() => [TanstackKey.COLLECTION_DISCOVERY, 'community']);
    const queryFn = this.fetchCollectionsQueryFn(() => this.discoveryParams('community'));

    return useQuery<Pagination<Collection>>({
      queryKey,
      queryFn,
    });
  }

  fetchDiscoveryMyCollections() {
    const queryKey = computed(() => [TanstackKey.COLLECTION_DISCOVERY, 'my']);
    const queryFn = this.fetchMyCollectionsQueryFn(() => this.discoveryParams('my-collections'));

    return useQuery<Pagination<Collection>>({
      queryKey,
      queryFn,
    });
  }

  async prefetchDiscoveryCollections() {
    const queryClient = useQueryClient();

    const curatedQueryKey = [TanstackKey.COLLECTION_DISCOVERY, 'curated'];
    const communityQueryKey = [TanstackKey.COLLECTION_DISCOVERY, 'community'];
    const myCollectionsQueryKey = [TanstackKey.COLLECTION_DISCOVERY, 'my'];

    const curatedQueryFn = this.fetchCollectionsQueryFn(() => this.discoveryParams('curated'));
    const communityQueryFn = this.fetchCollectionsQueryFn(() => this.discoveryParams('community'));
    const myCollectionsQueryFn = this.fetchMyCollectionsQueryFn(() =>
      this.discoveryParams('my-collections'),
    );

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: curatedQueryKey,
        queryFn: curatedQueryFn,
      }),
      queryClient.prefetchQuery({
        queryKey: communityQueryKey,
        queryFn: communityQueryFn,
      }),
      queryClient.prefetchQuery({
        queryKey: myCollectionsQueryKey,
        queryFn: myCollectionsQueryFn,
      }),
    ]);
  }

  fetchDiscoveryLikedCollections(params: ComputedRef<number>) {
    const queryKey = computed(() => [TanstackKey.COLLECTION_DISCOVERY, 'liked', params.value]);
    const queryFn = this.fetchLikedCollectionsQueryFn(() => ({
      pageSize: 10,
    }));

    return useQuery<Pagination<Collection>>({
      queryKey,
      queryFn,
    });
  }

  fetchMyCollections(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.MY_COLLECTIONS,
      params.value.sort,
      params.value.categories,
      params.value.pageSize,
      params.value.page,
    ]);

    const queryFn = this.fetchMyCollectionsQueryFn(() => ({
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

  fetchMyCollectionsQueryFn(
    query: () => Record<string, string | number | string[] | undefined>,
  ): QueryFunction<Pagination<Collection>, readonly unknown[], number> {
    return async ({ pageParam = 0 }) =>
      await $fetch('/api/collection/community/my', {
        params: {
          page: pageParam,
          ...query(),
        },
      });
  }

  mapCollectionTypes(collections: Collection[]): Collection[] {
    return collections.map((collection) => ({
      ...collection,
      isLf: !!collection.ssoUserId,
    }));
  }

  async createCollection(payload: CollectionPayload): Promise<Collection> {
    return await $fetch<Collection>('/api/collection/community', {
      method: 'POST',
      body: payload,
    });
  }

  async updateCollection(id: string, payload: CollectionPayload): Promise<Collection> {
    return await $fetch<Collection>(`/api/collection/community/${id}`, {
      method: 'PUT',
      body: payload,
    });
  }

  async deleteCollection(id: string): Promise<void> {
    await $fetch(`/api/collection/community/${id}`, {
      method: 'DELETE',
    });
  }

  fetchLikedCollections(params: ComputedRef<{ page?: number; pageSize: number }>) {
    const queryKey = computed(() => [
      TanstackKey.LIKED_COLLECTIONS,
      params.value.pageSize,
      params.value.page,
    ]);

    const queryFn = this.fetchLikedCollectionsQueryFn(() => ({
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
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;
        const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
        return nextPage < totalPages ? nextPage : null;
      },
      initialPageParam: 0,
    });
  }

  fetchLikedCollectionsQueryFn(
    query: () => Record<string, string | number | undefined>,
  ): QueryFunction<Pagination<Collection>, readonly unknown[], number> {
    return async ({ pageParam = 0 }) =>
      await $fetch('/api/collection/like', {
        params: {
          page: pageParam,
          ...query(),
        },
      });
  }

  async likeCollection(collectionId: string): Promise<{ success: boolean }> {
    return await $fetch('/api/collection/like', {
      method: 'POST',
      body: { collectionId },
    });
  }

  async unlikeCollection(collectionId: string): Promise<{ success: boolean }> {
    return await $fetch('/api/collection/like', {
      method: 'DELETE',
      body: { collectionId },
    });
  }

  fetchCollectionProjects(params: ComputedRef<CollectionProjectsQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.COLLECTION_PROJECTS,
      params.value.slug,
      params.value.sort,
      params.value.isLF,
      params.value.page,
      params.value.pageSize,
    ]);

    const queryFn = this.fetchCollectionProjectsQueryFn(() => ({
      ...params.value,
    }));

    return useInfiniteQuery<
      Pagination<ProjectInsights>,
      Error,
      Pagination<ProjectInsights>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;
        const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
        return nextPage < totalPages ? nextPage : null;
      },
      initialPageParam: 0,
    });
  }

  fetchCollectionProjectsQueryFn(
    query: () => CollectionProjectsQueryParams,
  ): QueryFunction<Pagination<ProjectInsights>, readonly unknown[], number> {
    return async ({ pageParam = 0 }) => {
      const { slug, ...rest } = query();
      return await $fetch(`/api/collection/${slug}/projects`, {
        params: {
          page: pageParam,
          ...rest,
        },
      });
    };
  }

  async prefetchCollectionProjects(params: ComputedRef<CollectionProjectsQueryParams>) {
    const queryClient = useQueryClient();
    const queryKey = computed(() => [
      TanstackKey.COLLECTION_PROJECTS,
      params.value.slug,
      params.value.sort,
      params.value.isLF,
      params.value.page,
      params.value.pageSize,
    ]);

    const queryFn = this.fetchCollectionProjectsQueryFn(() => ({
      ...params.value,
    }));

    return await queryClient.prefetchInfiniteQuery<
      Pagination<ProjectInsights>,
      Error,
      Pagination<ProjectInsights>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;
        const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
        return nextPage < totalPages ? nextPage : null;
      },
    });
  }
}

export const COLLECTIONS_API_SERVICE = new CollectionsApiService();
