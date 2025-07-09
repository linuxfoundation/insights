// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from "luxon";
import type {ActivityCountFilter} from "~~/server/data/types";
import {ActivityFilterCountType} from "~~/server/data/types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {Granularity} from "~~/types/shared/granularity";
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
 *   openedSummary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   mergedSummary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   closedSummary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   avgVelocityInDays: number;
 *   data: {
 *     startDate: string; // ISO 8601 date string - start of the bucket. Based on the interval
 *     endDate: string; // ISO 8601 date string - end of the bucket. Based on the interval
 *     open: number; // count of open pull requests
 *     merged: number; // count of merged pull requests
 *     closed: number; // count of closed pull requests
 *   }[];
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

  const filter: ActivityCountFilter = {
    project,
    granularity: query.granularity as Granularity,
    repo: query.repository as string,
    countType: ActivityFilterCountType.NEW, // TODO: This isn't used but I'm keeping it here for now to satisfy the interface
    activity_type: ActivityTypes.ISSUES_CLOSED, // TODO: This isn't used but I'm keeping it here for now to satisfy the interface
    onlyContributions: false,
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();

  return await dataSource.fetchPullRequests(filter);
});
