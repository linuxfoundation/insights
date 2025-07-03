// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from "luxon";
import type {ActivityCountFilter, FilterGranularity} from "~~/server/data/types";
import {ActivityFilterCountType} from "~~/server/data/types";
import {createDataSource} from "~~/server/data/data-sources";
import {ActivityTypes} from "~~/types/shared/activity-types";

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
 *     openedIssues: number; // count of opened issues
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
    countType: ActivityFilterCountType.NEW,
    activity_type: ActivityTypes.ISSUES_OPENED,
    onlyContributions: false,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();

  return await dataSource.fetchIssuesOpened(filter);
}); 