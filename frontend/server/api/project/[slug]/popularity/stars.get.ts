import {DateTime} from "luxon";
import type {ActivityCountFilter, FilterGranularity} from "~~/server/data/types";
import {ActivityFilterActivityType, ActivityFilterCountType} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";

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
 *     stars: number; // count of stars
 *   }[];
 * }
 */
/**
 * Query params:
 * - type: 'cumulative' | 'new'
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  const filter: ActivityCountFilter = {
    project,
    granularity: query.granularity as FilterGranularity,
    repo: query.repository as string,
    countType: (query.countType as ActivityFilterCountType) || ActivityFilterCountType.NEW,
    activityType: (query.activityType as ActivityFilterActivityType) || ActivityFilterActivityType.STARS,
    onlyContributions: false, // forks and stars are non-contribution activities, but we want to count them.
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();

  return await dataSource.fetchStarsActivities(filter);
});
