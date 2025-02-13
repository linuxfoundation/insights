import { allMetrics, commits } from '~~/server/mocks/contributor-leaderboard.mock';

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
