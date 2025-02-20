import { allMetrics, commits } from '~~/server/mocks/organization-dependency.mock';

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
  const { metric } = query;
  const data = { ...(metric === 'all' ? allMetrics : commits) };

  switch (metric) {
    case 'all':
      data.topOrganizations.count = 3;
      break;
    case 'pull-requests-opened':
      data.topOrganizations.count = 5;
      break;
    case 'issues-opened':
      data.topOrganizations.count = 1;
      break;
    default:
      data.topOrganizations.count = 2;
      break;
  }

  return data;
});
