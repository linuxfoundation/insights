import { quarterly, weekly, monthly } from '~~/server/mocks/active-contributors.mock';

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
      contributions: item.contributions - 3000
    }));
  }

  return data;
});
