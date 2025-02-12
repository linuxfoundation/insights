import { allMetrics, commits } from '~~/server/mocks/organization-leaderboard.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   logo: string;
 *   name: string;
 *   contributions: number;
 *   website: string;
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
  const { metric } = query;

  if (metric === 'all') {
    return allMetrics;
  }

  return commits;
});
