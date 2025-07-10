// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from "luxon";
import { createDataSource } from "~~/server/data/data-sources";
import type {PackageMetricsFilter} from "~~/server/data/types";
import {Granularity} from "~~/types/shared/granularity";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const filter: PackageMetricsFilter = {
    project,
    granularity: query.granularity as Granularity,
    repo: query.repo as string,
    ecosystem: query.ecosystem as string,
    startDate: query.startDate
      ? DateTime.fromISO(query.startDate as string)
      : undefined,
    endDate: query.endDate
      ? DateTime.fromISO(query.endDate as string)
      : undefined,
    name: query.name as string,
  };

  const dataSource = createDataSource();
  return dataSource.fetchPackageMetrics(filter);
});
