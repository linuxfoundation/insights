// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import { createDataSource } from '~~/server/data/data-sources'
import type {
  CodeReviewEngagementFilter,
  CodeReviewEngagementMetric,
} from '~~/types/development/requests.types'
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
 *     avatar: string;
 *     name: string;
 *     activityCount: number;
 *     percentage: number;
 *     email: string;
 *   }[]
 * }
 */
/**
 * Query params:
 * - metric: 'pr-participants' | 'review-comments' | 'code-reviews'
 * - project: string
 * - repository: string
 * - time-period: string
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const project = (event.context.params as { slug: string }).slug

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined

  const filter: CodeReviewEngagementFilter = {
    project,
    repos,
    granularity: (query?.granularity as Granularity) || Granularity.QUARTERLY,
    metric: query.metric as CodeReviewEngagementMetric,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource()

  return await dataSource.fetchCodeReviewEngagement(filter)
})
