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
 *     contributors: number; // count of active contributors
 *   }[];
 * }
 */
/**
 * Query params:
 * - granularity: 'weekly' | 'monthly' | 'quarterly'
 * - project: string
 * - repository: string
 * - time-period: string // This isn't defined yet, but we'll add '90d', '1y', '5y' for now
 */
import {parseISO} from 'date-fns';

import {
  createActiveContributorsDataSource
} from '~~/server/data/active-contributors-data-source';
import type {ActiveContributorsFilter} from '~~/server/data/types';
import {ContributorsFilterGranularity} from '~~/server/data/types';

export default defineEventHandler(async (event) => {
  // TODO: Check the project configuration to determine whether to show the data.
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;

  // TODO: Validate the query params
  const filter: ActiveContributorsFilter = {
    granularity: (query.granularity as ContributorsFilterGranularity) || ContributorsFilterGranularity.QUARTERLY,
    project,
    repo: undefined,
    fromDate: undefined,
    toDate: undefined
  };

  if (query.repository && (query.repository as string).trim() !== '') {
    filter.repo = query.repository as string;
  }

  if (query.fromDate && (query.fromDate as string).trim() !== '') {
    filter.fromDate = parseISO(query.fromDate as string);
  }

  if (query.toDate && (query.toDate as string).trim() !== '') {
    filter.toDate = parseISO(query.toDate as string);
  }

  const dataSource = createActiveContributorsDataSource();

  try {
    return await dataSource.fetchActiveContributors(filter);
  } catch (error) {
    console.error('Error fetching active contributors:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch active contributors data',
      data: { message: error.message }
    });
  }
});
