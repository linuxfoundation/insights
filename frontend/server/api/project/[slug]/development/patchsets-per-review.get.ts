// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { PatchSetsFilter } from '~~/server/data/types';
import { Granularity } from '~~/types/shared/granularity';
import { createDataSource } from '~~/server/data/data-sources';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current median/average patchsets
 *     previous: number; // previous median/average patchsets
 *     percentageChange: number; // percentage change
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   data: {
 *     startDate: string; // ISO 8601 date string
 *     endDate: string; // ISO 8601 date string
 *     median: number; // median patchsets per review
 *     average: number; // average patchsets per review
 *   }[];
 * }
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: PatchSetsFilter = {
    project,
    granularity: query.granularity as Granularity,
    repos,
    dataType: query.dataType as string,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  };

  const dataSource = createDataSource();

  return await dataSource.fetchPatchsetsPerReview(filter);
});
