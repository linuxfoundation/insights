import {DateTime} from "luxon";
import {createDataSource} from "~~/server/data/data-sources";
import type {ContributorsLeaderboardFilter} from "~~/server/data/types";
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

  const filter: ContributorsLeaderboardFilter = {
    project,
    metric: (query.metric as FilterActivityMetric) || FilterActivityMetric.ALL,
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
