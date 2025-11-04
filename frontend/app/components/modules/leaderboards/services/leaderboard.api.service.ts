// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { type QueryFunction, useInfiniteQuery } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import type { Pagination } from '~~/types/shared/pagination';

export interface LeaderboardDetailQueryParams {
  leaderboardType: string;
  search?: string;
  initialPageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;
class LeaderboardApiService {
  //   async prefetchLeaderboardDetails(params: ComputedRef<LeaderboardDetailQueryParams>) {
  //     const queryClient = useQueryClient();
  //     const queryKey = computed(() => [
  //       TanstackKey.LEADERBOARD_DETAIL,
  //       params.value.sort,
  //       params.value.categories,
  //     ]);

  //     const queryFn = this.fetchCollectionsQueryFn(() => ({
  //       ...params.value,
  //     }));

  //     return await queryClient.prefetchInfiniteQuery<
  //       Pagination<Collection>,
  //       Error,
  //       Pagination<Collection>,
  //       readonly unknown[],
  //       number
  //     >({
  //       queryKey,
  //       queryFn,
  //       initialPageParam: 0,
  //       getNextPageParam: this.getNextPageCollectionsParam,
  //     });
  //   }
  getNextPageLeaderboardParam(lastPage: Pagination<Leaderboard>) {
    let nextPage = Number(lastPage.page) + 1;

    // Handle the case where initialPageSize is greater than DEFAULT_PAGE_SIZE
    if (lastPage.pageSize > DEFAULT_PAGE_SIZE) {
      nextPage = Number(lastPage.pageSize) / DEFAULT_PAGE_SIZE + 1;
    }

    const totalPages = Math.ceil(lastPage.total / DEFAULT_PAGE_SIZE);
    return nextPage < totalPages ? nextPage : null;
  }

  fetchLeaderboardDetails(params: ComputedRef<LeaderboardDetailQueryParams>) {
    const queryKey = computed(() => [TanstackKey.LEADERBOARD_DETAIL, params.value.leaderboardType]);

    const queryFn = this.leaderboardDetailQueryFn(() => ({
      leaderboardType: params.value.leaderboardType,
      initialPageSize: params.value.initialPageSize,
      search: params.value.search,
    }));

    return useInfiniteQuery<
      Pagination<Leaderboard>,
      Error,
      Pagination<Leaderboard>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      getNextPageParam: this.getNextPageLeaderboardParam,
      initialPageParam: 0,
    });
  }

  leaderboardDetailQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<Pagination<Leaderboard>, readonly unknown[], number> {
    const { leaderboardType, initialPageSize, search } = query();
    return async ({ pageParam = 0 }) => {
      const pageSize = pageParam === 0 ? (initialPageSize ?? DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

      return await $fetch(`/api/leaderboard/${leaderboardType}`, {
        params: {
          page: pageParam,
          pageSize,
          search,
        },
      });
    };
  }

  fetchLeaderboardDetailSearch(params: ComputedRef<LeaderboardDetailQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.LEADERBOARD_DETAIL_SEARCH,
      params.value.leaderboardType,
      params.value.search,
    ]);

    const queryFn = this.leaderboardDetailQueryFn(() => ({
      leaderboardType: params.value.leaderboardType,
      initialPageSize: 20,
      search: params.value.search,
    }));

    return useInfiniteQuery<
      Pagination<Leaderboard>,
      Error,
      Pagination<Leaderboard>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      getNextPageParam: this.getNextPageLeaderboardParam,
      initialPageParam: 0,
    });
  }
}

export const LEADERBOARD_API_SERVICE = new LeaderboardApiService();
