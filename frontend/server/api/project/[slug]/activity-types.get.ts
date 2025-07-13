// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {createDataSource} from "~~/server/data/data-sources";
import type {ActivityTypesFilter} from "~~/types/development/requests.types";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const project = (event.context.params as { slug: string }).slug;

  const filter: ActivityTypesFilter = {
    project,
    repository: query?.repository as string,
  };

  const dataSource = createDataSource();

  return await dataSource.fetchActivityTypes(filter);
});