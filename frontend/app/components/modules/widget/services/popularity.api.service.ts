// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, type Ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  ForksData,
  MailingListsMessages,
  Package,
  PackageDownloads,
  SearchQueries,
  StarsData,
  GithubMentions,
  PressMentions,
  SocialMentions,
} from '~~/types/popularity/responses.types';

export interface QueryParams {
  projectSlug?: string;
  collectionSlug?: string;
  granularity: string;
  repos?: string[];
  startDate: string | null;
  endDate: string | null;
}
export interface PopularityQueryParams extends QueryParams {
  ecosystem?: string;
  name?: string;
}

export interface ActivityTypeQueryParams extends QueryParams {
  type: string;
  countType: string;
}

export interface PackagesQueryParams {
  projectSlug?: string;
  collectionSlug?: string;
  repos?: string[];
  search?: string;
}

export interface GithubMentionsQueryParams extends QueryParams {
  type: string;
}

export interface SocialMentionsQueryParams extends QueryParams {
  type: string;
}

class PopularityApiService {
  fetchPackageDownloads(params: ComputedRef<PopularityQueryParams>, enabled?: Ref<boolean>) {
    const queryKey = computed(() => [
      TanstackKey.PACKAGE_DOWNLOADS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.ecosystem,
      params.value.name,
    ]);
    const queryFn = computed<QueryFunction<PackageDownloads>>(() =>
      this.packageDownloadsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        ecosystem: params.value.ecosystem,
        name: params.value.name,
      })),
    );

    return useQuery<PackageDownloads>({
      queryKey,
      queryFn,
      enabled,
    });
  }

  packageDownloadsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<PackageDownloads> {
    const { projectSlug, collectionSlug, repos, granularity, startDate, endDate, ecosystem, name } =
      query();
    return async () =>
      await $fetch(`/api/widget/popularity/package-downloads`, {
        params: {
          project: projectSlug,
          collectionSlug,
          repos,
          granularity,
          startDate,
          endDate,
          ecosystem,
          name,
        },
      });
  }

  fetchPackages(params: ComputedRef<PackagesQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.PACKAGES,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.repos,
      params.value.search,
    ]);
    const queryFn = computed<QueryFunction<Package[]>>(() =>
      this.packagesQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        search: params.value.search,
      })),
    );

    return useQuery<Package[]>({
      queryKey,
      queryFn,
    });
  }

  packagesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<Package[]> {
    const { projectSlug, collectionSlug, repos, search } = query();
    return async () =>
      await $fetch(`/api/widget/popularity/packages`, {
        params: {
          project: projectSlug,
          collectionSlug,
          repos,
          search,
        },
      });
  }

  fetchSearchQueries(params: ComputedRef<QueryParams>, enabled?: Ref<boolean>) {
    const queryKey = computed(() => [
      TanstackKey.SEARCH_QUERIES,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<SearchQueries>>(() =>
      this.searchQueriesQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<SearchQueries>({
      queryKey,
      queryFn,
      enabled,
    });
  }

  searchQueriesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<SearchQueries> {
    const { projectSlug, collectionSlug, repos, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/widget/popularity/search-queries`, {
        params: {
          project: projectSlug,
          collectionSlug,
          repos,
          startDate,
          endDate,
        },
      });
  }

  fetchMailingListsMessages(params: ComputedRef<ActivityTypeQueryParams>, enabled?: Ref<boolean>) {
    const queryKey = computed(() => [
      TanstackKey.MAILING_LISTS_MESSAGES,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.type,
      params.value.countType,
    ]);
    const queryFn = computed<QueryFunction<MailingListsMessages>>(() =>
      this.mailingListsMessagesQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        type: params.value.type,
        countType: params.value.countType,
      })),
    );

    return useQuery<MailingListsMessages>({
      queryKey,
      queryFn,
      enabled,
    });
  }

  mailingListsMessagesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<MailingListsMessages> {
    const { projectSlug, collectionSlug, repos, startDate, endDate, granularity, type, countType } =
      query();
    return async () =>
      await $fetch(`/api/widget/popularity/mailing-lists-messages`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          type,
          countType,
          activityType: 'message',
          repos,
          startDate,
          endDate,
        },
      });
  }

  fetchForks(params: ComputedRef<ActivityTypeQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.FORKS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.type,
      params.value.countType,
    ]);
    const queryFn = computed<QueryFunction<ForksData>>(() =>
      this.forksQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        type: params.value.type,
        countType: params.value.countType,
      })),
    );

    return useQuery<ForksData>({
      queryKey,
      queryFn,
    });
  }

  forksQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ForksData> {
    const { projectSlug, collectionSlug, repos, startDate, endDate, granularity, type, countType } =
      query();
    return async () =>
      await $fetch(`/api/widget/popularity/forks`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          type,
          countType,
          activityType: 'fork',
          repos,
          startDate,
          endDate,
        },
      });
  }

  fetchStars(params: ComputedRef<ActivityTypeQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.STARS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.type,
      params.value.countType,
    ]);
    const queryFn = computed<QueryFunction<StarsData>>(() =>
      this.starsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        type: params.value.type,
        countType: params.value.countType,
      })),
    );

    return useQuery<StarsData>({
      queryKey,
      queryFn,
    });
  }

  starsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<StarsData> {
    const { projectSlug, collectionSlug, repos, startDate, endDate, granularity, type, countType } =
      query();
    return async () =>
      await $fetch(`/api/widget/popularity/stars`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          type,
          countType,
          activityType: 'star',
          repos,
          startDate,
          endDate,
        },
      });
  }

  fetchGithubMentions(params: ComputedRef<GithubMentionsQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.GITHUB_MENTIONS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.type,
    ]);
    const queryFn = computed<QueryFunction<GithubMentions>>(() =>
      this.githubMentionsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        type: params.value.type,
      })),
    );

    return useQuery<GithubMentions>({
      queryKey,
      queryFn,
    });
  }

  githubMentionsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<GithubMentions> {
    const { projectSlug, collectionSlug, repos, startDate, endDate, granularity, type } = query();
    return async () =>
      await $fetch(`/api/widget/popularity/github-mentions`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          type,
          repos,
          startDate,
          endDate,
        },
      });
  }

  fetchPressMentions(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.PRESS_MENTIONS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<PressMentions>>(() =>
      this.pressMentionsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<PressMentions>({
      queryKey,
      queryFn,
    });
  }

  pressMentionsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<PressMentions> {
    const { projectSlug, collectionSlug, repos, startDate, endDate, granularity } = query();
    return async () =>
      await $fetch(`/api/widget/popularity/press-mentions`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          repos,
          startDate,
          endDate,
        },
      });
  }

  fetchSocialMentions(params: ComputedRef<SocialMentionsQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.SOCIAL_MENTIONS,
      params.value.projectSlug,
      params.value.collectionSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.type,
    ]);
    const queryFn = computed<QueryFunction<SocialMentions>>(() =>
      this.socialMentionsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        collectionSlug: params.value.collectionSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        type: params.value.type,
      })),
    );

    return useQuery<SocialMentions>({
      queryKey,
      queryFn,
    });
  }

  socialMentionsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<SocialMentions> {
    const { projectSlug, collectionSlug, repos, startDate, endDate, granularity, type } = query();
    return async () =>
      await $fetch(`/api/widget/popularity/social-mentions`, {
        params: {
          project: projectSlug,
          collectionSlug,
          granularity,
          type,
          repos,
          startDate,
          endDate,
        },
      });
  }

  isPackageDownloadsEmpty(data: PackageDownloads | undefined) {
    if (!data?.data) {
      return true;
    }
    return data.data.every((item) => item.downloadsCount === 0 && item.dockerDownloadsCount === 0);
  }
  isPackageDependencyEmpty(data: PackageDownloads | undefined) {
    if (!data?.data) {
      return true;
    }
    return data.data.every(
      (item) =>
        item.dependentReposCount === 0 &&
        item.dependentPackagesCount === 0 &&
        item.dockerDependentsCount === 0,
    );
  }
  isSearchQueriesEmpty(data: SearchQueries | undefined) {
    if (!data?.data) {
      return true;
    }
    return data.data.every((item) => item.queryCount === 0);
  }
  isMailingListMessagesEmpty(data: MailingListsMessages | undefined) {
    if (!data?.data) {
      return true;
    }
    return data.data.every((item) => item.messages === 0);
  }
}

export const POPULARITY_API_SERVICE = new PopularityApiService();
