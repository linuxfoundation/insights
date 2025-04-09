import { DateTime } from "luxon";
import type { MergeLeadTimeFilter } from "~~/server/data/types";
import { createDataSource } from "~~/server/data/data-sources";

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
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const filter: MergeLeadTimeFilter = {
    project,
    repo: query.repository as string,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();

  return await dataSource.fetchMergeLeadTime(filter);
});
