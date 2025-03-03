import {
  prParticipants,
  reviewComments,
  codeReviews
} from '~~/server/mocks/code-review-engagement.mock';

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
 *     avatar: string;
 *     name: string;
 *     activityCount: number;
 *     percentage: number;
 *     email: string;
 *   }[]
 * }
 */
/**
 * Query params:
 * - metric: 'pr-participants' | 'review-comments' | 'code-reviews'
 * - project: string
 * - repository: string
 * - time-period: string
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { metric } = query;
  let data;

  switch (metric) {
    case 'pr-participants':
      data = { ...prParticipants };
      break;
    case 'review-comments':
      data = { ...reviewComments };
      break;
    case 'code-reviews':
      data = { ...codeReviews };
      break;
    default:
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid metric'
      });
  }

  return data;
});
