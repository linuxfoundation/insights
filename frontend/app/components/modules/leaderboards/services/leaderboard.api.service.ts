// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

export interface LeaderboardDetailQueryParams {
  leaderboardType: string;
  search?: string;
  initialPageSize?: number;
}

// TODO: Refactor other services to follow this pattern
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
  fetchLeaderboardDetails(params: ComputedRef<LeaderboardDetailQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.LEADERBOARD_DETAIL,
      params.value.leaderboardType,
      params.value.search,
    ]);
    const queryFn = computed<QueryFunction<Leaderboard>>(() =>
      this.leaderboardDetailQueryFn(() => ({
        leaderboardType: params.value.leaderboardType,
        initialPageSize: params.value.initialPageSize,
        search: params.value.search,
      })),
    );

    return useInfiniteQuery<Leaderboard>({
      queryKey,
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        // TODO: fix this once the backend returns the total number of pages
        const nextPage = 2;
        const totalPages = lastPage.value;
        return nextPage < totalPages ? nextPage : null;
      },
    });
  }

  leaderboardDetailQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<Leaderboard> {
    const { leaderboardType, initialPageSize, search } = query();
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number;
      const pageSize = pageParam === 0 ? (initialPageSize ?? 10) : 10;

      return await $fetch(`/api/leaderboard/${leaderboardType}`, {
        params: {
          page: pageParam,
          pageSize,
          search,
        },
      });
    };
  }
}

export const LEADERBOARD_API_SERVICE = new LeaderboardApiService();
