// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { MedianTimeToMergeFilter } from '~~/server/data/types';
import { Granularity } from '~~/types/shared/granularity';
import { createDataSource } from '~~/server/data/data-sources';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current median time in seconds
 *     previous: number; // previous median time in seconds
 *     percentageChange: number; // percentage change
 *     changeValue: number; // change value in seconds
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   data: {
 *     startDate: string; // ISO 8601 date string
 *     endDate: string; // ISO 8601 date string
 *     medianTime: number; // median time to merge in seconds
 *   }[];
 * }
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: MedianTimeToMergeFilter = {
    project,
    granularity: query.granularity as Granularity,
    repos,
    platform: query.platform as string | undefined,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  };

  const dataSource = createDataSource();

  return await dataSource.fetchMedianTimeToMerge(filter);
});
