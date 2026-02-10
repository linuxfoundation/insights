// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
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
  projectSlug: string;
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
  projectSlug: string;
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
  fetchPackageDownloads(params: ComputedRef<PopularityQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.PACKAGE_DOWNLOADS,
      params.value.projectSlug,
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
    });
  }

  packageDownloadsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<PackageDownloads> {
    const { projectSlug, repos, granularity, startDate, endDate, ecosystem, name } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/package-downloads`, {
        params: {
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
      params.value.repos,
      params.value.search,
    ]);
    const queryFn = computed<QueryFunction<Package[]>>(() =>
      this.packagesQueryFn(() => ({
        projectSlug: params.value.projectSlug,
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
    const { projectSlug, repos, search } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/packages`, {
        params: {
          repos,
          search,
        },
      });
  }

  fetchSearchQueries(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.SEARCH_QUERIES,
      params.value.projectSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<SearchQueries>>(() =>
      this.searchQueriesQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<SearchQueries>({
      queryKey,
      queryFn,
    });
  }

  searchQueriesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<SearchQueries> {
    const { projectSlug, repos, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/search-queries`, {
        params: {
          repos,
          startDate,
          endDate,
        },
      });
  }

  fetchMailingListsMessages(params: ComputedRef<ActivityTypeQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.MAILING_LISTS_MESSAGES,
      params.value.projectSlug,
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
    });
  }

  mailingListsMessagesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<MailingListsMessages> {
    const { projectSlug, repos, startDate, endDate, granularity, type, countType } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/mailing-lists-messages`, {
        params: {
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
    const { projectSlug, repos, startDate, endDate, granularity, type, countType } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/forks`, {
        params: {
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
    const { projectSlug, repos, startDate, endDate, granularity, type, countType } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/stars`, {
        params: {
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
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.type,
    ]);
    const queryFn = computed<QueryFunction<GithubMentions>>(() =>
      this.githubMentionsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
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
    const { projectSlug, repos, startDate, endDate, granularity, type } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/github-mentions`, {
        params: {
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
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<PressMentions>>(() =>
      this.pressMentionsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
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
    const { projectSlug, repos, startDate, endDate, granularity } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/press-mentions`, {
        params: {
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
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.type,
    ]);
    const queryFn = computed<QueryFunction<SocialMentions>>(() =>
      this.socialMentionsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
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
    const { projectSlug, repos, startDate, endDate, granularity, type } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/popularity/social-mentions`, {
        params: {
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
