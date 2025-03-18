import {DateTime} from "luxon";
import {createDataSource} from "~~/server/data/data-sources";
import type {ContributorsLeaderboardFilter} from "~~/server/data/types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {ActivityPlatforms} from "~~/types/shared/activity-platforms";

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

  const filter: ContributorsLeaderboardFilter = {
    project,
    platform: activityPlatform !== ActivityPlatforms.ALL ? activityPlatform : undefined,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    repository: query.repository as string,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  };
  const dataSource = createDataSource();
  const result = await dataSource.fetchContributorsLeaderboard(filter);

  const meta = {
    offset: 0,
    limit: 10,
    total: 100
  };

  return {
    meta,
    data: result.data
  };
});
