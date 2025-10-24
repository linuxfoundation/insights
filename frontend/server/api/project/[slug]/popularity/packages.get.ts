// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createDataSource } from '~~/server/data/data-sources';
import type { PackageFilter } from '~~/server/data/types';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: PackageFilter = {
    project,
    repos,
    search: query.search as string,
  };

  const dataSource = createDataSource();
  return dataSource.fetchPackages(filter);
});
