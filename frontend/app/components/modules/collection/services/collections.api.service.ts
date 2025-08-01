// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import type { Pagination } from '~~/types/shared/pagination';
import type { Collection } from '~~/types/collection';
import type { Category, CategoryGroup } from '~~/types/category';

export interface CategoryGroupOptions {
  value: string;
  categories: Category[];
  id: string;
  name: string;
}
class CollectionsApiService {
  fetchCollections(
    query: () => Record<string, string | number | string[] | undefined>
  ): QueryFunction<Pagination<Collection>> {
    return async ({ pageParam = 0 }) => await $fetch('/api/collection', {
        params: {
          page: pageParam,
          ...query(),
        },
      });
  }

  fetchCollection(slug: string): QueryFunction<Collection> {
    return () => $fetch(`/api/collection/${slug}`);
  }

  fetchCategoryGroups(
    query: () => Record<string, string | number>
  ): QueryFunction<Pagination<CategoryGroup>> {
    return () => $fetch(`/api/category`, {
        params: query(),
      });
  }
}

export const COLLECTIONS_API_SERVICE = new CollectionsApiService();
