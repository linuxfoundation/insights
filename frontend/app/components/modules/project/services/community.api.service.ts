// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { computed, type ComputedRef } from 'vue';
import type { QueryFunction } from '@tanstack/vue-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import type { Project } from '~~/types/project';
import type { User } from '~~/types/auth/auth-user.types';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { CommunityMentions } from '~~/types/community/community';
import type { Pagination } from '~~/types/shared/pagination';

export interface QueryParams {
  projectSlug: string;
  platforms?: string[];
  keywords?: string[];
  sentiments?: string[];
  languages?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

class ProjectCommunityApiService {
  async prefetchCommunityMentions(params: ComputedRef<QueryParams>) {
    const queryClient = useQueryClient();
    const queryKey = computed(() => [
      TanstackKey.COMMUNITY_MENTIONS,
      params.value.projectSlug,
      params.value.platforms,
      params.value.keywords,
      params.value.sentiments,
      params.value.languages,
      params.value.startDate,
      params.value.endDate,
    ]);

    const queryFn = this.fetchCommunityMentionsQueryFn(() => ({
      ...params.value,
    }));

    return await queryClient.prefetchInfiniteQuery<
      Pagination<CommunityMentions>,
      Error,
      Pagination<CommunityMentions>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      initialPageParam: 0,
      getNextPageParam: this.getNextPageCollectionsParam,
    });
  }

  getNextPageCollectionsParam(lastPage: Pagination<CommunityMentions>) {
    const nextPage = Number(lastPage.page) + 1;
    const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
    return nextPage < totalPages ? nextPage : null;
  }

  fetchCommunityMentions(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.COMMUNITY_MENTIONS,
      params.value.projectSlug,
      params.value.platforms,
      params.value.keywords,
      params.value.sentiments,
      params.value.languages,
      params.value.startDate,
      params.value.endDate,
    ]);

    const queryFn = computed<QueryFunction<Pagination<CommunityMentions>>>(() =>
      this.fetchCommunityMentionsQueryFn(() => ({
        ...params.value,
      })),
    );

    return useInfiniteQuery<
      Pagination<CommunityMentions>,
      Error,
      Pagination<CommunityMentions>,
      readonly unknown[],
      number
    >({
      queryKey,
      //@ts-expect-error - TanStack Query type inference issue with Vue
      queryFn,
      getNextPageParam: this.getNextPageCollectionsParam,
      initialPageParam: 0,
    });
  }

  fetchCommunityMentionsQueryFn(
    query: () => Record<string, string | number | string[] | undefined | null>,
  ): QueryFunction<Pagination<CommunityMentions>, readonly unknown[], number> {
    return async ({ pageParam = 0 }) =>
      await $fetch(`/api/project/${query().projectSlug}/community`, {
        params: {
          page: pageParam,
          ...query(),
        },
      });
  }

  isCommunityEnabled(project: Project, user: User | null) {
    const hasConnectedPlatforms =
      Array.isArray(project.communityPlatforms) && project.communityPlatforms.length > 0;
    const hasPermission = user?.hasLfxInsightsPermission || false;
    return hasConnectedPlatforms && hasPermission;
  }
}

export const PROJECT_COMMUNITY_API_SERVICE = new ProjectCommunityApiService();
