// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { LocationQuery } from 'vue-router';
import type { URLParams } from '~/components/shared/utils/query-param';

export const collectionListParamsGetter = (query: LocationQuery): URLParams => ({
  listCategory: (query.listCategory as string) || undefined,
  listSort: (query.listSort as string) || undefined,
});

export const collectionDetailsParamsGetter = (query: LocationQuery): URLParams => ({
  collectionTab: (query.collectionTab as string) || undefined,
  collectionSort: (query.collectionSort as string) || undefined,
});

export const collectionListParamsSetter = (query: URLParams) => {
  const tmpQuery = { ...query };

  return tmpQuery;
};
