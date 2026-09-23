// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type TSchema } from '@sinclair/typebox';

import { ActivityType, ContributionFlags, SeriesQuery } from '../schemas/common.js';
import { toIsoUtc } from './period.js';

// contributor_retention and organization_retention take the same params and return the same
// columns; only the entity they track (memberId vs organizationId) differs.
export interface RetentionRow {
  startDate: string;
  endDate: string;
  retentionRate: number;
}

export const isRetentionRow = (row: RetentionRow): boolean =>
  typeof row.startDate === 'string' &&
  typeof row.endDate === 'string' &&
  typeof row.retentionRate === 'number';

export const toRetentionBucket = (row: RetentionRow) => ({
  startDate: toIsoUtc(row.startDate),
  endDate: toIsoUtc(row.endDate),
  retentionPercentage: row.retentionRate,
});

export const RetentionQuery = Type.Object({
  ...SeriesQuery.properties,
  activityType: Type.Optional(ActivityType),
  ...ContributionFlags.properties,
});

export function retentionBucket(noun: string): TSchema {
  return Type.Object({
    startDate: Type.String({
      format: 'date-time',
      description: 'First day of the bucket, at 00:00:00 UTC.',
    }),
    endDate: Type.String({
      format: 'date-time',
      description: 'Last calendar day of the bucket, at 00:00:00 UTC.',
    }),
    retentionPercentage: Type.Number({
      description:
        `Share of the ${noun}s active in the previous bucket who were active again in this one, in percent (0 to 100), rounded to two decimals. ` +
        'A bucket with no activity in the preceding one, which can include the first bucket when there is no prior data, reports 0, not null.',
    }),
  });
}

export function retentionResponse(noun: string): TSchema {
  return Type.Object({
    data: Type.Array(retentionBucket(noun), {
      description: `One entry per granularity bucket, ascending by \`startDate\`. An unknown project or a pipe with no data returns an empty list.`,
    }),
  });
}
