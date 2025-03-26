import { newMentions } from '~~/server/mocks/github-mentions.mock';

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
 *     queryCount: number; // count of mentions
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
  summary: newMentions.summary,
  data: newMentions.data.map((item) => ({
    ...item,
    queryCount: item.mentions
  }))
}));
