import { allMetrics, commits } from '~~/server/mocks/contributor-leaderboard.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   avatar: string;
 *   name: string;
 *   contributions: number;
 *   email: string;
 * }
 */
/**
 * Query params:
 * - metric: 'all' | 'commits' | 'issues' (this needs to be defined)
 * - project: string
 * - repository: string
 * - time-period: string
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const {metric} = query;

  if (metric === 'all') {
    return allMetrics;
  }

  return commits;
});
