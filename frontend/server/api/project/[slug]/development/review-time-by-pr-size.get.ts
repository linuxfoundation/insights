// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { ReviewTimeByPRSizeFilter } from '~~/server/data/types';
import { createDataSource } from '~~/server/data/data-sources';

/**
 * Frontend expects the data to be in the following format:
 * [
 *   {
 *     sortId: number;
 *     lines: string;
 *     prCount: number;
 *     averageReviewTime: number;
 *     averageReviewTimeUnit: string;
 *   }
 * ]
 */
/**
 * Query params:
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: ReviewTimeByPRSizeFilter = {
    project,
    repos,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  };

  const dataSource = createDataSource();

  return await dataSource.fetchReviewTimeByPRSize(filter);
});
