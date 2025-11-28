// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { computed } from 'vue';
import { type LocationQuery, useRoute, useRouter } from 'vue-router';

export type URLParams = {
  timeRange?: string;
  start?: string | null;
  end?: string | null;
  widget?: string;
  // collection list
  listCategory?: string;
  listSort?: string;
  // collection details
  collectionTab?: string;
  collectionSort?: string;
  repos?: string;
  generateYaml?: string;
};

export const useQueryParam = (
  getterProcessor: (query: LocationQuery) => URLParams,
  setterProcessor: (query: URLParams) => URLParams,
) => {
  const route = useRoute();
  const router = useRouter();

  const queryParams = computed<URLParams>({
    get: () => getterProcessor(route.query),
    set: (value: URLParams) => {
      const query: URLParams = {
        ...(route.query as URLParams),
        ...value,
      };

      const processedQuery = setterProcessor(query);

      router.push({ query: processedQuery });
    },
  });

  return {
    queryParams,
  };
};
