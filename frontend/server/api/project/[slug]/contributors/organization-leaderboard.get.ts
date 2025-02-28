import { allMetrics, commits } from '~~/server/mocks/organization-leaderboard.mock';

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
  const { metric } = query;
  const meta = {
    offset: 0,
    limit: 10,
    total: 100
  };

  if (metric === 'all') {
    return {
      meta,
      data: allMetrics
    };
  }

  return {
    meta,
    data: commits
  };
});
