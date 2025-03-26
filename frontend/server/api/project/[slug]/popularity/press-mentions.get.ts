import { cumulative } from '~~/server/mocks/github-mentions.mock';
import { latesMentionDetails } from '~~/server/mocks/press-mentions.mock';

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     startDate: string; // start date
 *     endDate: string; // end date
 *   },
 *   data: {
 *     startDate: string; // start date
 *     endDate: string; // end date
 *     mentions: number; // count of mentions
 *   }[],
 *   list: {
 *     thumbnail: string; // thumbnail url
 *     title: string; // title
 *     url: string; // url
 *     date: string; // date
 *     description: string; // description
 *   }[];
 * }
 */
/**
 * Query params:
 * - granularity: string
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async () => ({
  ...cumulative,
  list: latesMentionDetails
}));
