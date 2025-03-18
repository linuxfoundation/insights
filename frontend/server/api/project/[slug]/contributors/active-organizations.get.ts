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
 *     startDate: string; // ISO 8601 date string - start of the bucket. Based on the interval
 *     endDate: string; // ISO 8601 date string - end of the bucket. Based on the interval
 *     organizations: number; // count of active organizations
 *   }[];
 * }
 */
import {DateTime} from "luxon";
import type {ActiveOrganizationsFilter} from "~~/server/data/types";
import {FilterGranularity} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";

/**
 * Query params:
 * - granularity: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
 * - project: string
 * - repository: string
 * - time-period: string // This is isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
export default defineEventHandler(async (event) => {
  // TODO: Check the project configuration to determine whether to show the data.
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  // TODO: Validate the query params
  const filter: ActiveOrganizationsFilter = {
    granularity: (query.granularity as FilterGranularity) || FilterGranularity.QUARTERLY,
    project,
    repo: undefined,
    startDate: undefined,
    endDate: undefined
  };

  if (query.repository && (query.repository as string).trim() !== '') {
    filter.repo = query.repository as string;
  }

  if (query.startDate && (query.startDate as string).trim() !== '') {
    filter.startDate = DateTime.fromISO(query.startDate as string);
  }

  if (query.endDate && (query.endDate as string).trim() !== '') {
    filter.endDate = DateTime.fromISO(query.endDate as string);
  }

  const dataSource = createDataSource();

  try {
    return await dataSource.fetchActiveOrganizations(filter);
  } catch (error) {
    console.error('Error fetching active organizations:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch active organizations data',
      data: { message: error.message }
    });
  }
});
