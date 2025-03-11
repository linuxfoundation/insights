import {
  contributorRetention,
  organizationRetention
} from '~~/server/mocks/retention.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   startDate: string; // ISO 8601 date string - start of the bucket. Based on the interval
 *   endDate: string; // ISO 8601 date string - end of the bucket. Based on the interval
 *   percentage: number; // percentage retention
 * }[]
 */
/**
 * Query params:
 * - type: 'contributors' | 'organizations'
 * - project: string // slug
 * - repository: string // In the old Insights this is the fully qualified URL of the repo
 * - time-period: string // see below
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let data;

  if (query.type === 'contributors') {
    data = contributorRetention;
  } else if (query.type === 'organizations') {
    data = organizationRetention;
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid type'
    });
  }

  return data;
});
