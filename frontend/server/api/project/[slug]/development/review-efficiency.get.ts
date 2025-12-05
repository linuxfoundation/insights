// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { ReviewEfficiencyFilter } from '~~/server/data/types';
import { Granularity } from '~~/types/shared/granularity';
import { createDataSource } from '~~/server/data/data-sources';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current efficiency ratio (closed/opened)
 *     previous: number; // previous efficiency ratio
 *     percentageChange: number; // percentage change
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   openedSummary: {
 *     current: number;
 *     previous: number;
 *     percentageChange: number;
 *     changeValue: number;
 *     periodFrom: string;
 *     periodTo: string;
 *   },
 *   closedSummary: {
 *     current: number;
 *     previous: number;
 *     percentageChange: number;
 *     changeValue: number;
 *     periodFrom: string;
 *     periodTo: string;
 *   },
 *   data: {
 *     startDate: string; // ISO 8601 date string
 *     endDate: string; // ISO 8601 date string
 *     opened: number; // count of opened pull requests
 *     closed: number; // count of closed/merged pull requests
 *   }[];
 * }
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: ReviewEfficiencyFilter = {
    project,
    granularity: query.granularity as Granularity,
    repos,
    platform: query.platform as string | undefined,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  };

  const dataSource = createDataSource();

  return await dataSource.fetchReviewEfficiency(filter);
});
