import { quarterly, weekly, monthly } from '~~/server/mocks/active-orgs.mock';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  if (query.interval === 'weekly') {
    return weekly;
  }
  if (query.interval === 'monthly') {
    return monthly;
  }
  return quarterly;
});
