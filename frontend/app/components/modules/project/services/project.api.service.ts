// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { type QueryFunction, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import type { Pagination } from '~~/types/shared/pagination';
import type { Project } from '~~/types/project';
import { TanstackKey } from '~/components/shared/types/tanstack';

export interface ProjectsQueryParams {
  sort: string;
  pageSize: number;
  isLF: boolean;
  collectionSlug: string;
}

class ProjectApiService {
  async prefetchProjects(params: ComputedRef<ProjectsQueryParams>) {
    const queryClient = useQueryClient();
    const queryKey = computed(() => [
      TanstackKey.PROJECTS,
      params.value.sort,
      params.value.isLF,
      params.value.collectionSlug,
      params.value.pageSize,
    ]);

    const queryFn = this.fetchProjectsQueryFn(() => ({
      ...params.value,
    }));

    return await queryClient.prefetchInfiniteQuery<
      Pagination<Project>,
      Error,
      Pagination<Project>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      initialPageParam: 0,
      getNextPageParam: this.getNextPageProjectsParam,
    });
  }

  getNextPageProjectsParam(lastPage: Pagination<Project>) {
    const nextPage = lastPage.page + 1;
    const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
    return nextPage < totalPages ? nextPage : undefined;
  }
  fetchProjects(params: ComputedRef<ProjectsQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.PROJECTS,
      params.value.sort,
      params.value.isLF,
      params.value.collectionSlug,
      params.value.pageSize,
    ]);

    const queryFn = this.fetchProjectsQueryFn(() => ({
      ...params.value,
    }));

    return useInfiniteQuery<
      Pagination<Project>,
      Error,
      Pagination<Project>,
      readonly unknown[],
      number
    >({
      queryKey,
      queryFn,
      getNextPageParam: this.getNextPageProjectsParam,
      initialPageParam: 0,
    });
  }
  fetchProjectsQueryFn(
    query: () => Record<string, string | number | boolean>,
  ): QueryFunction<Pagination<Project>, readonly unknown[], number> {
    return async ({ pageParam = 0 }) =>
      await $fetch('/api/project', {
        params: {
          page: pageParam,
          ...query(),
        },
      });
  }

  fetchProject(slug: string): QueryFunction<Project> {
    return () => $fetch(`/api/project/${slug}`);
  }
}

export const PROJECT_API_SERVICE = new ProjectApiService();
