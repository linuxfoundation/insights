// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Package, PackageDownloads } from '~~/types/popularity/responses.types';

export interface PopularityQueryParams {
  projectSlug: string;
  granularity: string;
  repos?: string[];
  startDate: string | null;
  endDate: string | null;
  ecosystem?: string;
  name?: string;
}

export interface PackagesQueryParams {
  projectSlug: string;
  repos?: string[];
  search?: string;
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
    const queryFn = computed<QueryFunction<PackageDownloads>>(() => this.packageDownloadsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        ecosystem: params.value.ecosystem,
        name: params.value.name,
      })));

    return useQuery<PackageDownloads>({
      queryKey,
      queryFn,
    });
  }

  packageDownloadsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<PackageDownloads> {
    const {
 projectSlug, repos, granularity, startDate, endDate, ecosystem, name
} = query();
    return async () => await $fetch(`/api/project/${projectSlug}/popularity/package-downloads`, {
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
    const queryFn = computed<QueryFunction<Package[]>>(() => this.packagesQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        search: params.value.search,
      })));

    return useQuery<Package[]>({
      queryKey,
      queryFn,
    });
  }

  packagesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<Package[]> {
    const { projectSlug, repos, search } = query();
    return async () => await $fetch(`/api/project/${projectSlug}/popularity/packages`, {
        params: {
          repos,
          search,
        },
      });
  }
}

export const POPULARITY_API_SERVICE = new PopularityApiService();
