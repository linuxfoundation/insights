import {DateTime} from "luxon";
import type { OrganizationDependencyFilter} from "~~/server/data/types";
import {FilterGranularity} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {ActivityPlatforms} from "~~/types/shared/activity-platforms";

/**
 * Frontend expects the data to be in the following format:
 * {
 *   topOrganizations: {
 *     count: number; // number of top organizations
 *     percentage: number; // percentage of the top organizations for the selected filter
 *   },
 *   otherOrganizations: {
 *     count: number; // count of the rest of organizations excluding the top
 *     percentage: number; // percentage of the other organizations for the selected filter
 *   },
 *   list: [ // this could be similar to the organizations leaderboard
 *     {
 *       logo: string;
 *       name: string;
 *       contributions: number;
 *       percentage: number; // however this wasn't needed in the leaderboard
 *       website: string;
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
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const activityPlatform = query.platform as ActivityPlatforms;
  const activityType = query.activityType as ActivityTypes;

  const filter: OrganizationDependencyFilter = {
    project,
    granularity: (query.granularity as FilterGranularity) || FilterGranularity.QUARTERLY,
    platform: activityPlatform !== ActivityPlatforms.ALL ? activityPlatform : undefined,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    repo: query.repository as string,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();
  return await dataSource.fetchOrganizationDependency(filter);
});
