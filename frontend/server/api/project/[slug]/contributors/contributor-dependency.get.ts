import {DateTime} from "luxon";
import {createDataSource} from "~~/server/data/data-sources";
import {FilterActivityMetric} from "~~/server/data/types";

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
  const query = getQuery(event);

  const filter = {
    metric: (query.metric as FilterActivityMetric) || FilterActivityMetric.ALL,
    project: query.project as string,
    repository: query.repository as string,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();
  return await dataSource.fetchContributorDependency(filter);
});
