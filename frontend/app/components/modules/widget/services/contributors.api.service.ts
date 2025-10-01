// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query'
import { type ComputedRef, computed } from 'vue'
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import { TanstackKey } from '~/components/shared/types/tanstack'
import type {
  ContributorLeaderboard,
  OrganizationLeaderboard,
  ActiveContributors,
} from '~~/types/contributors/responses.types'

export interface ContributorQueryParams {
  projectSlug: string
  platform?: string
  repos?: string[]
  startDate?: string | null
  endDate?: string | null
  includeCollaborations?: boolean
}

export interface LeaderboardQueryParams extends ContributorQueryParams {
  activityType?: string
}

export interface ActiveContributorsQueryParams extends ContributorQueryParams {
  granularity?: string
}

class ContributorsApiService {
  fetchContributorLeaderboard(params: ComputedRef<LeaderboardQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CONTRIBUTORS_LEADERBOARD,
      params.value.projectSlug,
      params.value.platform,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ])
    const queryFn = computed<QueryFunction<ContributorLeaderboard>>(() =>
      this.contributorLeaderboardQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        platform: params.value.platform,
        activityType: params.value.activityType,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    )

    return useInfiniteQuery<ContributorLeaderboard>({
      queryKey,
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.meta.offset + lastPage.meta.limit
        const totalRows = lastPage.meta.total
        return nextPage < totalRows ? nextPage : undefined
      },
    })
  }

  contributorLeaderboardQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ContributorLeaderboard> {
    const {
      projectSlug,
      platform,
      activityType,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query()
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number

      return await $fetch(`/api/project/${projectSlug}/contributors/contributor-leaderboard`, {
        params: {
          platform,
          activityType,
          repos,
          startDate,
          endDate,
          offset: pageParam,
          limit: 10,
          includeCollaborations,
        },
      })
    }
  }

  fetchOrganizationLeaderboard(params: ComputedRef<LeaderboardQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ORGANIZATIONS_LEADERBOARD,
      params.value.projectSlug,
      params.value.platform,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ])
    const queryFn = computed<QueryFunction<OrganizationLeaderboard>>(() =>
      this.organizationLeaderboardQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        platform: params.value.platform,
        activityType: params.value.activityType,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    )

    return useInfiniteQuery<OrganizationLeaderboard>({
      queryKey,
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.meta.offset + lastPage.meta.limit
        const totalRows = lastPage.meta.total
        return nextPage < totalRows ? nextPage : undefined
      },
    })
  }

  organizationLeaderboardQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<OrganizationLeaderboard> {
    const {
      projectSlug,
      platform,
      activityType,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query()
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number

      return await $fetch(`/api/project/${projectSlug}/contributors/organization-leaderboard`, {
        params: {
          platform,
          activityType,
          repos,
          startDate,
          endDate,
          offset: pageParam,
          limit: 10,
          includeCollaborations,
        },
      })
    }
  }

  fetchActiveContributors(params: ComputedRef<ActiveContributorsQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ACTIVE_CONTRIBUTORS,
      params.value.projectSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.granularity,
      params.value.includeCollaborations,
    ])
    const queryFn = computed<QueryFunction<ActiveContributors>>(() =>
      this.activeContributorsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        granularity: params.value.granularity,
        includeCollaborations: params.value.includeCollaborations,
      })),
    )

    return useQuery<ActiveContributors>({
      queryKey,
      queryFn,
    })
  }

  activeContributorsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ActiveContributors> {
    const { projectSlug, repos, startDate, endDate, granularity, includeCollaborations } = query()
    return async () => {
      return await $fetch(`/api/project/${projectSlug}/contributors/active-contributors`, {
        params: {
          granularity,
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      })
    }
  }
}

export const CONTRIBUTORS_API_SERVICE = new ContributorsApiService()
