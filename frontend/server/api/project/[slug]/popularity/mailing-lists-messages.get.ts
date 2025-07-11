// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from "luxon";
import type {ActivityCountFilter} from "~~/server/data/types";
import {ActivityFilterCountType} from "~~/server/data/types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {createDataSource} from "~~/server/data/data-sources";
import {Granularity} from "~~/types/shared/granularity";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const project = (event.context.params as { slug: string }).slug;
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: ActivityCountFilter = {
    project,
    granularity: query.granularity as Granularity,
    repos,
    countType: (query.countType as ActivityFilterCountType) || ActivityFilterCountType.NEW,
    activity_type: (query.activityType as ActivityTypes) || ActivityTypes.MESSAGE,
    onlyContributions: false, // forks and stars are non-contribution activities, but we want to count them.
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  }

  const dataSource = createDataSource();

  return await dataSource.fetchMailingListsMessageActivities(filter);
});
