// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createDataSource } from '~~/server/data/data-sources';
import type { PackageFilter } from '~~/server/data/types';
import { getWidgetScope } from '~~/server/utils/common';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const scope = getWidgetScope(query);
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: PackageFilter = {
    ...scope,
    repos,
    search: query.search as string,
  };

  const dataSource = createDataSource();
  return dataSource.fetchPackages(filter);
});
