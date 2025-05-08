/**
 * See responses.types.ts for the response format.
 */

import { trustScoreSummary } from '~~/server/mocks/score-data.mock';

/**
 * Query params:
 * - projectSlug: string
 * - repository?: string
 */
export default defineEventHandler(async () => trustScoreSummary);
