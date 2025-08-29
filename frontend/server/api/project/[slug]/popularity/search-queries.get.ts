// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import { fetchSearchVolume } from '~~/server/data/tinybird/search-queries-data-source'
import type { SearchVolumeFilter } from '~~/server/data/types'

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     startDate: string; // start date
 *     endDate: string; // end date
 *   },
 *   data: {
 *     startDate: string; // start date
 *     endDate: string; // end date
 *     queryCount: number; // count of mentions
 *   }[];
 * }
 */
/**
 * Query params:
 * - granularity: string
 * - project: string
 * - repository: string
 * - time-period: string // This isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const project = (event.context.params as { slug: string }).slug

  const filter: SearchVolumeFilter = {
    project,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const searchVolumeData = await fetchSearchVolume(filter)

  return {
    data: searchVolumeData.data
      .map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        queryCount: item.queryCount,
      }))
      .sort(
        (a, b) =>
          DateTime.fromISO(a.startDate).toMillis() - DateTime.fromISO(b.startDate).toMillis(),
      ),
  }
})
