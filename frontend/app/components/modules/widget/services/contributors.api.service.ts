import type { QueryFunction } from '@tanstack/vue-query';
import type { ComputedRef } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import type {
  ContributorLeaderboard,
  OrganizationLeaderboard
} from '~~/types/contributors/responses.types';

class ContributorsApiService {
  fetchContributorLeaderboard(
    queryKey: ComputedRef,
    queryFn: ComputedRef<QueryFunction<ContributorLeaderboard>>
  ) {
    return useInfiniteQuery<ContributorLeaderboard>({
      queryKey,
      // TODO: fix this type error
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.meta.offset + lastPage.meta.limit;
        const totalRows = lastPage.meta.total;
        return nextPage < totalRows ? nextPage : undefined;
      }
    });
  }

  contributorLeaderboardQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<ContributorLeaderboard> {
    const {
 projectSlug, platform, activityType, repository, startDate, endDate
} = query();
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number;

      return await $fetch(
        `/api/project/${projectSlug}/contributors/contributor-leaderboard`,
        {
          params: {
            platform,
            activityType,
            repository,
            startDate,
            endDate,
            offset: pageParam,
            limit: 10
          }
        }
      );
    };
  }

  fetchOrganizationLeaderboard(
    queryKey: ComputedRef,
    queryFn: ComputedRef<QueryFunction<OrganizationLeaderboard>>
  ) {
    return useInfiniteQuery<OrganizationLeaderboard>({
      queryKey,
      // TODO: fix this type error
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.meta.offset + lastPage.meta.limit;
        const totalRows = lastPage.meta.total;
        return nextPage < totalRows ? nextPage : undefined;
      }
    });
  }

  organizationLeaderboardQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<OrganizationLeaderboard> {
    const {
 projectSlug, platform, activityType, repository, startDate, endDate
} = query();
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number;

      return await $fetch(
        `/api/project/${projectSlug}/contributors/organization-leaderboard`,
        {
          params: {
            platform,
            activityType,
            repository,
            startDate,
            endDate,
            offset: pageParam,
            limit: 10
          }
        }
      );
    };
  }
}

export const CONTRIBUTORS_API_SERVICE = new ContributorsApiService();
