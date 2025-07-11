// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from "luxon";
import type {ActivityCountFilter} from "~~/server/data/types";
import {ActivityFilterCountType} from "~~/server/data/types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {createDataSource} from "~~/server/data/data-sources";
import {Granularity} from "~~/types/shared/granularity";

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
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: ActivityCountFilter = {
    project,
    granularity: query.granularity as Granularity,
    repos,
    countType: (query.countType as ActivityFilterCountType) || ActivityFilterCountType.NEW,
    activity_type: (query.activityType as ActivityTypes) || ActivityTypes.STARS,
    onlyContributions: false, // forks and stars are non-contribution activities, but we want to count them.
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();

  return await dataSource.fetchStarsActivities(filter);
});
