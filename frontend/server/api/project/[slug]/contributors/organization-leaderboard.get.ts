import {DateTime} from "luxon";
import {createDataSource} from "~~/server/data/data-sources";
import type {OrganizationsLeaderboardFilter} from "~~/server/data/types";
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
 *       logo: string; // URL of the organization's logo
 *       name: string; // Name of the organization
 *       contributions: number; // Total number of contributions
 *       contributionValue: number; // Value of the contribution
 *       website: string; // Website of the organization
 *     }
 *   ]
 * }
 */
/**
 * Query params:
 * - metric: 'all' | 'commits' | 'issues' (this needs to be defined)
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

  const meta = {
    offset: 0,
    limit: 10,
    total: 100
  };

  const filter: OrganizationsLeaderboardFilter = {
    project,
    platform: activityPlatform !== ActivityPlatforms.ALL ? activityPlatform : undefined,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    repo: query.repository as string,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  };

  const dataSource = createDataSource();
  const result = await dataSource.fetchOrganizationsLeaderboard(filter);

  return {
    meta,
    data: result.data
  };
});
