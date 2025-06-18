// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createDataSource } from "~~/server/data/data-sources";
import type {PackageFilter} from "~~/server/data/types";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const filter: PackageFilter = {
    project,
    repo: query.repo as string,
    search: query.search as string,
  };

  const dataSource = createDataSource();
  return dataSource.fetchPackages(filter);
});
