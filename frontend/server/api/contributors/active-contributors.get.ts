import { quarterly, weekly, monthly } from '~~/server/mocks/active-contributors.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   date: string; // ISO 8601 date string
 *   contributors: number; // count of active contributors
 * }
 */
/**
 * Query params:
 * - interval: 'weekly' | 'monthly' | 'quarterly'
 * - project: string
 * - repository: string
 * - time-period: string
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let data = [];

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
    data = data.map((item) => ({
      ...item,
      contributors: item.contributors - 3000
    }));
  }

  return data;
});
