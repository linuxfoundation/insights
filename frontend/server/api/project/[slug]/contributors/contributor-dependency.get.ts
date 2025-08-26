// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import { createDataSource } from '~~/server/data/data-sources'
import type { ContributorDependencyFilter } from '~~/server/data/types'
import { ActivityTypes } from '~~/types/shared/activity-types'
import { ActivityPlatforms } from '~~/types/shared/activity-platforms'

/**
 * Frontend expects the data to be in the following format:
 * {
 *   topContributors: {
 *     count: number; // number of top contributors
 *     percentage: number; // percentage of the top contributors for the selected filter
 *   },
 *   otherContributors: {
 *     count: number; // count of the rest of contributors excluding the top
 *     percentage: number; // percentage of the other contributors for the selected filter
 *   },
 *   list: [ // this could be similar to the contributors leaderboard
 *     {
 *       avatar: string;
 *       name: string;
 *       contributions: number;
 *       percentage: number; // however this wasn't needed in the leaderboard
 *       email: string;
 *     }
  ]
}
 */
/**
 * Query params:
 * - metric: 'all' | 'commits' | (see metrics options)
 * - project: string
 * - repository: string
 * - time-period: string
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const project = (event.context.params as { slug: string }).slug

  const activityPlatform = query.platform as ActivityPlatforms
  const activityType = query.activityType as ActivityTypes
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined

  const filter: ContributorDependencyFilter = {
    project,
    platform: activityPlatform !== ActivityPlatforms.ALL ? activityPlatform : undefined,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    repos,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource()
  return await dataSource.fetchContributorDependency(filter)
})
