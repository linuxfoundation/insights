// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  ContributorLeaderboard,
  OrganizationLeaderboard,
  ActiveContributors,
  ActiveOrganizations,
  ContributorDependency,
  OrganizationDependency,
  Retention,
} from '~~/types/contributors/responses.types';

export interface ContributorQueryParams {
  projectSlug?: string;
  collectionSlug?: string;
  platform?: string;
  repos?: string[];
  startDate?: string | null;
  endDate?: string | null;
  granularity?: string;
  includeCollaborations?: boolean;
}

export interface LeaderboardQueryParams extends ContributorQueryParams {
  activityType?: string;
}

export interface RetentionQueryParams extends ContributorQueryParams {
  type?: string;
}

export interface GeographicalDistributionQueryParams extends ContributorQueryParams {
  type?: string;
  platform?: string;
  activityType?: string;
}

class ContributorsApiService {
  fetchContributorLeaderboard(params: ComputedRef<LeaderboardQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CONTRIBUTORS_LEADERBOARD,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.platform,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<ContributorLeaderboard>>(() =>
      this.contributorLeaderboardQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        platform: params.value.platform,
        activityType: params.value.activityType,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useInfiniteQuery<ContributorLeaderboard>({
      queryKey,
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.meta.offset + lastPage.meta.limit;
        const totalRows = lastPage.meta.total;
        return nextPage < totalRows ? nextPage : undefined;
      },
    });
  }

  contributorLeaderboardQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ContributorLeaderboard> {
    const {
      projectSlug,
      collectionSlug,
      platform,
      activityType,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query();
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number;

      return await $fetch(`/api/widget/contributors/contributor-leaderboard`, {
        params: {
          project: projectSlug,
          collectionSlug,
          platform,
          activityType,
          repos,
          startDate,
          endDate,
          offset: pageParam,
          limit: 10,
          includeCollaborations,
        },
      });
    };
  }

  fetchOrganizationLeaderboard(params: ComputedRef<LeaderboardQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ORGANIZATIONS_LEADERBOARD,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.platform,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<OrganizationLeaderboard>>(() =>
      this.organizationLeaderboardQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        platform: params.value.platform,
        activityType: params.value.activityType,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useInfiniteQuery<OrganizationLeaderboard>({
      queryKey,
      // @ts-expect-error - queryFn is a computed ref
      queryFn,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.meta.offset + lastPage.meta.limit;
        const totalRows = lastPage.meta.total;
        return nextPage < totalRows ? nextPage : undefined;
      },
    });
  }

  organizationLeaderboardQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<OrganizationLeaderboard> {
    const {
      projectSlug,
      collectionSlug,
      platform,
      activityType,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query();
    return async (context) => {
      const pageParam = (context.pageParam || 0) as number;

      return await $fetch(`/api/widget/contributors/organization-leaderboard`, {
        params: {
          project: projectSlug,
          collectionSlug,
          platform,
          activityType,
          repos,
          startDate,
          endDate,
          offset: pageParam,
          limit: 10,
          includeCollaborations,
        },
      });
    };
  }

  fetchActiveContributors(params: ComputedRef<ContributorQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ACTIVE_CONTRIBUTORS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.granularity,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<ActiveContributors>>(() =>
      this.activeContributorsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        granularity: params.value.granularity,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery<ActiveContributors>({
      queryKey,
      queryFn,
    });
  }

  activeContributorsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ActiveContributors> {
    const {
      projectSlug,
      collectionSlug,
      repos,
      startDate,
      endDate,
      granularity,
      includeCollaborations,
    } = query();
    return async () => {
      return await $fetch(`/api/widget/contributors/active-contributors`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
    };
  }

  fetchActiveOrganizations(params: ComputedRef<ContributorQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ACTIVE_ORGANIZATIONS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.granularity,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<ActiveOrganizations>>(() =>
      this.activeOrganizationsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        granularity: params.value.granularity,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery<ActiveOrganizations>({
      queryKey,
      queryFn,
    });
  }

  activeOrganizationsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ActiveOrganizations> {
    const {
      projectSlug,
      collectionSlug,
      repos,
      startDate,
      endDate,
      granularity,
      includeCollaborations,
    } = query();
    return async () => {
      return await $fetch(`/api/widget/contributors/active-organizations`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
    };
  }

  fetchContributorDependency(params: ComputedRef<LeaderboardQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CONTRIBUTOR_DEPENDENCY,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.platform,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<ContributorDependency>>(() =>
      this.contributorDependencyQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        platform: params.value.platform,
        activityType: params.value.activityType,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery<ContributorDependency>({
      queryKey,
      queryFn,
    });
  }

  contributorDependencyQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ContributorDependency> {
    const {
      projectSlug,
      collectionSlug,
      platform,
      activityType,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query();
    return async () => {
      return await $fetch(`/api/widget/contributors/contributor-dependency`, {
        params: {
          project: projectSlug,
          collectionSlug,
          platform,
          activityType,
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
    };
  }

  fetchOrganizationDependency(params: ComputedRef<LeaderboardQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ORGANIZATION_DEPENDENCY,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.platform,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<OrganizationDependency>>(() =>
      this.organizationDependencyQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        platform: params.value.platform,
        activityType: params.value.activityType,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery<OrganizationDependency>({
      queryKey,
      queryFn,
    });
  }

  organizationDependencyQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<OrganizationDependency> {
    const {
      projectSlug,
      collectionSlug,
      platform,
      activityType,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query();
    return async () => {
      return await $fetch(`/api/widget/contributors/organization-dependency`, {
        params: {
          project: projectSlug,
          collectionSlug,
          platform,
          activityType,
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
    };
  }

  fetchRetention(params: ComputedRef<RetentionQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.RETENTION,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.type,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<Retention[]>>(() =>
      this.retentionQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        granularity: params.value.granularity,
        type: params.value.type,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery<Retention[]>({
      queryKey,
      queryFn,
    });
  }

  retentionQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<Retention[]> {
    const {
      projectSlug,
      collectionSlug,
      granularity,
      type,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query();
    return async () => {
      return await $fetch(`/api/widget/contributors/retention`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          type,
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
    };
  }

  fetchGeographicalDistribution(params: ComputedRef<GeographicalDistributionQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.GEOGRAPHICAL_DISTRIBUTION,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.type,
      params.value.platform,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed(() =>
      this.geographicalDistributionQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        type: params.value.type,
        platform: params.value.platform,
        activityType: params.value.activityType,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery({
      queryKey,
      queryFn,
    });
  }

  geographicalDistributionQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ) {
    const {
      projectSlug,
      collectionSlug,
      type,
      platform,
      activityType,
      repos,
      startDate,
      endDate,
      includeCollaborations,
    } = query();
    return async () => {
      return await $fetch(`/api/widget/contributors/geographical-distribution`, {
        params: {
          project: projectSlug,
          collectionSlug,
          type,
          platform,
          activityType,
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
    };
  }
}

export const CONTRIBUTORS_API_SERVICE = new ContributorsApiService();
