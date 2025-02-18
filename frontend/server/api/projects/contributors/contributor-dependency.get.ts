import { allMetrics, commits } from '~~/server/mocks/contributor-dependency.mock';

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
  const { metric } = query;

  if (metric === 'all') {
    return allMetrics;
  }

  return commits;
});
