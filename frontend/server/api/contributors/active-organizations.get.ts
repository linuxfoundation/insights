import { quarterly, weekly, monthly } from '~~/server/mocks/active-orgs.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   date: string; // ISO 8601 date string
 *   organizations: number; // count of active organizations
 * }
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
      organizations: item.organizations - 200
    }));
  }

  return data;
});
