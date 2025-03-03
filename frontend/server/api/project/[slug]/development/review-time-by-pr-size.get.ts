import { reviewTimeByPr } from '~~/server/mocks/review-time-by-pr.mock';

/**
 * Frontend expects the data to be in the following format:
 * [
 *   {
 *     sortId: number;
 *     lines: string;
 *     prCount: number;
 *     averageReviewTime: number;
 *     averageReviewTimeUnit: string;
 *   }
 * ]
 */
/**
 * Query params:
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async () => reviewTimeByPr);
