import {DateTime} from "luxon";
import { allMetrics, commits } from '~~/server/mocks/organization-dependency.mock';
import {FilterActivityMetric} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";

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

  const filter = {
    metric: (query.metric as FilterActivityMetric) || FilterActivityMetric.ALL,
    project: query.project as string,
    repository: query.repository as string,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();
  return await dataSource.fetchOrganizationDependency(filter);
});
