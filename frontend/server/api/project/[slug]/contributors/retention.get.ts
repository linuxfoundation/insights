// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { RetentionFilter } from '~~/server/data/types';
import { DemographicType } from '~~/server/data/types';
import { createDataSource } from '~~/server/data/data-sources';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { Granularity } from '~~/types/shared/granularity';
import { getBooleanQueryParam } from '~~/server/utils/common';

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

  const includeCodeContributions = getBooleanQueryParam(query, 'includeCodeContributions', true);
  const includeCollaborations = getBooleanQueryParam(query, 'includeCollaborations', false);

  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const filter: RetentionFilter = {
    project,
    granularity: query.granularity as Granularity,
    activity_type: activityType !== ActivityTypes.ALL ? activityType : undefined,
    includeCodeContributions,
    includeCollaborations,
    repos,
    demographicType: (query.type as DemographicType) || DemographicType.CONTRIBUTORS,
    onlyContributions: false, // forks and stars are non-contribution activities, but we want to count them.
    startDate: query.startDate ? DateTime.fromISO(query.startDate as string) : undefined,
    endDate: query.endDate ? DateTime.fromISO(query.endDate as string) : undefined,
  };
  const dataSource = createDataSource();
  const data = await dataSource.fetchRetention(filter);

  if (data) {
    return data;
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Error fetching retention data.',
  });
});
