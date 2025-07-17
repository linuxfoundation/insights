// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from "luxon";
import {createDataSource} from "~~/server/data/data-sources";
import type {ContributionsOutsideWorkHoursFilter} from "~~/types/development/requests.types";

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
 *   weekdayOutsideHoursPercentage: number; // percentage of contributions outside of work hours on a weekday
 *   weekendOutsideHoursPercentage: number; // percentage of contributions outside of work hours on a weekend
 *   data: {
 *     day: number; // day of the week
 *     hour: number; // hour of the day
 *     contributions: number; // count of contributions
 *   }[],
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

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: ContributionsOutsideWorkHoursFilter = {
    project,
    repos,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();

  return await dataSource.fetchContributionsOutsideWorkHours(filter);
});
