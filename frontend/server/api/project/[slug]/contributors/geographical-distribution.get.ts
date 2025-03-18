import {DateTime} from "luxon";
import type {GeographicDistributionFilter} from "~~/server/data/types";
import {DemographicType} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {ActivityPlatforms} from "~~/types/shared/activity-platforms";

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     totalContributions: number;
 *     periodFrom: string;
 *     periodTo: string;
 *   },
 *   data: [{
 *     name: string; // Country Name
 *     code: string; // country code
 *     flag: string; // flag url
 *     count: number; // count of contributors or organizations in that country
 *     percentage: number; // percentage of the contribution based on the total
 *   }]
 * }
 */
/**
 * Query params:
 * - type: 'contributors' | 'organizations'
 * - project: string
 * - repository: string
 * - time-period: string
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;
  const activityPlatform = query.platform as ActivityPlatforms;
  const activityType = query.activityType as ActivityTypes;

  const filter: GeographicDistributionFilter = {
    project,
    platform: activityPlatform !== ActivityPlatforms.ALL ? activityPlatform : undefined,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    repo: query.repository as string,
    type: (query.type as DemographicType) || DemographicType.CONTRIBUTORS,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }
  const dataSource = createDataSource();
  return await dataSource.fetchGeographicDistribution(filter);
});
