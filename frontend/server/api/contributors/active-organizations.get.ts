import { quarterly, weekly, monthly } from '~~/server/mocks/active-orgs.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   data: {
 *     dateFrom: string; // ISO 8601 date string - start of the bucket. Based on the interval
 *     dateTo: string; // ISO 8601 date string - end of the bucket. Based on the interval
 *     organizations: number; // count of active organizations
 *   }[];
 * }
 */
/**
 * Query params:
 * - interval: 'weekly' | 'monthly' | 'quarterly'
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let data;

  switch (query.interval) {
    case 'weekly':
      data = weekly;
      break;
    case 'monthly':
      data = monthly;
      break;
    default:
      data = quarterly;
      break;
  }

  // doing fake changes to data if query.repository is not empty
  if (query.repository) {
    data.data = data.data.map((item) => ({
      ...item,
      organizations: item.organizations - 200
    }));
  }

  return data;
});
