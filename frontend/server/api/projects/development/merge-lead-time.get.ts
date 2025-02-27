import { mergeLeadTime } from '~~/server/mocks/merge-lead-time.mock';

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
 *     pickup: {
 *       value: number; // value
 *       unit: string; // unit
 *       changeType: string; // 'positive' or 'negative'
 *     },
 *     review: {
 *       value: number; // value
 *       unit: string; // unit
 *       changeType: string; // 'positive' or 'negative'
 *     },
 *     accepted: {
 *       value: number; // value
 *       unit: string; // unit
 *       changeType: string; // 'positive' or 'negative'
 *     },
 *     prMerged: {
 *       value: number; // value
 *       unit: string; // unit
 *       changeType: string; // 'positive' or 'negative'
 *     }
 *   }
 * }
 */
/**
 * Query params:
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async () => mergeLeadTime);
