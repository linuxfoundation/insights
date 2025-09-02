// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import type { AverageTimeToMergeFilter } from '~~/server/data/types'
import { createDataSource } from '~~/server/data/data-sources'
import { Granularity } from '~~/types/shared/granularity'

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   data: {
 *     startDate: string; // ISO 8601 date string - start of the bucket. Based on the interval
 *     endDate: string; // ISO 8601 date string - end of the bucket. Based on the interval
 *     averageTime: number; // average time to merge in hours
 *   }[];
 * }
 */
/**
 * Query params:
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const project = (event.context.params as { slug: string }).slug

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined

  const filter: AverageTimeToMergeFilter = {
    project,
    granularity: query.granularity as Granularity,
    repos,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource()

  return await dataSource.fetchAverageTimeToMerge(filter)
})
