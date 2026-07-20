// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { createDataSource } from '~~/server/data/data-sources';
import type {
  CollectionContributorsLeaderboardFilter,
  ContributorsLeaderboardFilter,
} from '~~/server/data/types';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { getBooleanQueryParam, getWidgetScope } from '~~/server/utils/common';

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
 * - project OR collectionSlug: string (exactly one required)
 * - repository: string
 * - time-period: string
 * - offset: number
 * - limit: number
 *
 * project-scoped requests are served by contributors_leaderboard.pipe (unchanged).
 * collectionSlug-scoped requests are served by the separate, performance-optimized
 * collection_contributors_leaderboard pipe instead - see that pipe's DESCRIPTION and
 * collection-contributors-leaderboard.ts for why a naive collectionSlug branch on the
 * single-project pipe isn't used here.
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const scope = getWidgetScope(query);

  const activityPlatform = query.platform as ActivityPlatforms;
  const activityType = query.activityType as ActivityTypes;
  const includeCollaborations = getBooleanQueryParam(query, 'includeCollaborations', false);
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
  const offset = query.offset ? parseInt(query.offset as string, 10) : 0;
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;
  const startDate = query.startDate ? DateTime.fromISO(query.startDate as string) : undefined;
  const endDate = query.endDate ? DateTime.fromISO(query.endDate as string) : undefined;
  const platform = activityPlatform !== ActivityPlatforms.ALL ? activityPlatform : undefined;
  const activity_type = activityType !== ActivityTypes.ALL ? activityType : undefined;

  const dataSource = createDataSource();

  if (scope.collectionSlug) {
    const filter: CollectionContributorsLeaderboardFilter = {
      collectionSlug: scope.collectionSlug,
      platform,
      activity_type,
      includeCollaborations,
      repos,
      startDate,
      endDate,
      limit,
      offset,
    };
    return await dataSource.fetchCollectionContributorsLeaderboard(filter);
  }

  const includeCodeContributions = getBooleanQueryParam(query, 'includeCodeContributions', true);
  const filter: ContributorsLeaderboardFilter = {
    project: scope.project,
    platform,
    activity_type,
    includeCodeContributions,
    includeCollaborations,
    repos,
    startDate,
    endDate,
    limit,
    offset,
  };
  return await dataSource.fetchContributorsLeaderboard(filter);
});
