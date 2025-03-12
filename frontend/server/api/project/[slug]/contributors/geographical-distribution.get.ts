import {DateTime} from "luxon";
import type {GeographicDistributionFilter} from "~~/server/data/types";
import {FilterActivityMetric, DemographicType} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";

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

  const filter: GeographicDistributionFilter = {
    project,
    metric: (query.metric as FilterActivityMetric) || FilterActivityMetric.ALL,
    repository: query.repository as string,
    type: (query.type as DemographicType) || DemographicType.CONTRIBUTORS,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }
  const dataSource = createDataSource();
  return await dataSource.fetchGeographicDistribution(filter);
});
