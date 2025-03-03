import { averageTimeMerge } from '~~/server/mocks/average-time-merge.mock';

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
 *     averageTime: number; // average time to merge in hours
 *   }[];
 * }
 */
/**
 * Query params:
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async () => averageTimeMerge);
