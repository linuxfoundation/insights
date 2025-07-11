// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { createDataSource } from '~~/server/data/data-sources';
import type { ContributorsLeaderboardFilter } from '~~/server/data/types';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   meta: {
 *     offset: number;
 *     limit: number;
 *     total: number;
 *   },
 *   data: [
 *     {
 *       avatar: string | undefined; // URL of the user's profile pic or avatar.
 *       name: string; // Full name of the contributor
 *       contributions: number; // Total number of contributions
 *       contributionValue: number; // Value of the contribution
 *       email: string; // Email of the contributor
 *     }
 *   ]
 * }
 */
/**
 * Query params:
 * - metric: 'all' | 'commits' | (see metrics options)
 * - project: string
 * - repository: string
 * - time-period: string
 * - offset: number
 * - limit: number
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;
  const activityPlatform = query.platform as ActivityPlatforms;
  const activityType = query.activityType as ActivityTypes;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
  const offset = query.offset ? parseInt(query.offset as string, 10) : 0;
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: ContributorsLeaderboardFilter = {
    project,
    platform: activityPlatform !== ActivityPlatforms.ALL ? activityPlatform : undefined,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    repos,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
    limit,
    offset
  };

  const dataSource = createDataSource();
  return await dataSource.fetchContributorsLeaderboard(filter);
});
