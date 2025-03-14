import {DateTime} from "luxon";
import {createDataSource} from "~~/server/data/data-sources";
import type {OrganizationsLeaderboardFilter} from "~~/server/data/types";
import {FilterActivityMetric} from "~~/server/data/types";

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

  const meta = {
    offset: 0,
    limit: 10,
    total: 100
  };

  const filter: OrganizationsLeaderboardFilter = {
    project,
    metric: (query.metric as FilterActivityMetric) || FilterActivityMetric.ALL,
    repository: query.repository as string,
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
