import {DateTime} from "luxon";
import type {FilterGranularity, RetentionFilter} from "~~/server/data/types";
import {DemographicType} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";
import {ActivityTypes} from "~~/types/shared/activity-types";

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

  const project = (event.context.params as { slug: string }).slug;
  const activityType = query.activityType as ActivityTypes;

  const filter: RetentionFilter = {
    project,
    granularity: query.granularity as FilterGranularity,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    repo: query.repository as string,
    demographicType: (query.type as DemographicType) || DemographicType.CONTRIBUTORS,
    onlyContributions: false, // forks and stars are non-contribution activities, but we want to count them.
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }
  const dataSource = createDataSource();
  const data = await dataSource.fetchRetention(filter);

  if (data) {
    return data;
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Error fetching retention data.'
  });
});
