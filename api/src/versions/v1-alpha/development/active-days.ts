// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { Type } from '@sinclair/typebox';
import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import { periodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/active_days.json';

interface SummaryRow {
  activeDaysCount: number;
  avgContributionsPerDay: number | null;
}

interface SeriesRow {
  startDate: string | null;
  endDate: string | null;
  activityCount?: number | null;
}

const ActiveDaysQuery = Type.Object({
  ...SeriesQuery.properties,
  includeCollaborations: Type.Optional(
    Type.Boolean({
      default: false,
      description:
        'Also count collaboration activity (reviews, comments and similar) as contributions, alongside code contributions.',
    }),
  ),
});

const ActiveDaysBucket = Type.Object({
  startDate: Type.String({
    format: 'date-time',
    description: 'First day of the bucket, at 00:00:00 UTC.',
  }),
  endDate: Type.String({
    format: 'date-time',
    description: 'Last calendar day of the bucket, at 00:00:00 UTC.',
  }),
  contributions: Type.Integer({ description: 'Number of contributions in the bucket (count).' }),
});

const ActiveDaysSummary = periodSummary({
  measure: 'Active days',
  unit: 'count of days',
  kind: 'integer',
  title: 'ActiveDaysSummary',
  description: 'Active days in the current period against the previous one.',
});

const ActiveDays = Type.Object({
  summary: ActiveDaysSummary,
  avgContributionsPerDay: Type.Number({
    description:
      'Average number of contributions per active day in the current period (count per day). 0 when there are no active days.',
  }),
  data: Type.Array(ActiveDaysBucket, {
    description:
      'One entry per granularity bucket in the current period. A bucket the pipe reports without both bounds is omitted.',
  }),
});

const activeDaysRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/active-days',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get active days',
        description:
          'Returns the number of days with at least one development activity in the period against the previous period, the average contributions per active day, and the contributions per bucket. The previous period ends the day before `startDate` and covers the same calendar span as the current period, counted in whole months plus remaining days the way the Insights UI does, so its number of days can differ around month ends. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zeros and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: ActiveDaysQuery,
        response: { 200: ActiveDays },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const {
        repos,
        startDate,
        endDate,
        granularity,
        includeCollaborations = false,
      } = request.query;
      const dates = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          includeCodeContributions: true,
          includeCollaborations,
        };
        const currentRange = toTinybirdRange(dates.current);

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, { ...shared, ...currentRange }),
          fetchPipe<SummaryRow>(request, pipePath, {
            ...shared,
            ...toTinybirdRange(dates.previous),
          }),
          fetchPipe<SeriesRow>(request, pipePath, { ...shared, ...currentRange, granularity }),
        ]);
      });
      if (!rows) {
        return {
          summary: toPeriodSummary(0, 0, dates.current),
          avgContributionsPerDay: 0,
          data: [],
        };
      }

      const [currentRows, previousRows, seriesRows] = rows;
      const current = currentRows[0];
      const previous = previousRows[0];
      return {
        summary: toPeriodSummary(
          current?.activeDaysCount ?? 0,
          previous?.activeDaysCount ?? 0,
          dates.current,
        ),
        avgContributionsPerDay: current?.avgContributionsPerDay ?? 0,
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          contributions: row.activityCount ?? 0,
        })),
      };
    },
  );
};

export default activeDaysRoutes;
