// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  TinybirdProjectNotFoundError,
  type TinybirdClient,
  type TinybirdQuery,
} from '@lfx-insights/tinybird-client';
import { Type } from '@sinclair/typebox';
import { getTinybirdClient } from '../../../clients/tinybird.js';
import { UpstreamUnavailableError } from '../../../lib/errors.js';
import { getPreviousDates, toPeriodSummary, type DateRange } from '../../../lib/period.js';
import {
  DateRangeQuery,
  Granularity,
  PeriodSummary,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/active_days.json';

interface SummaryRow {
  activeDaysCount: number;
  avgContributionsPerDay: number | null;
}

interface SeriesRow {
  startDate: string;
  endDate: string;
  activityCount: number;
}

const ActiveDaysQuery = Type.Composite([
  DateRangeQuery,
  Type.Object({
    granularity: { ...Granularity, description: 'Width of each bucket in `data`.' },
    includeCollaborations: Type.Optional(
      Type.Boolean({
        default: false,
        description:
          'Also count collaboration activity (reviews, comments and similar) as contributions, alongside code contributions.',
      }),
    ),
  }),
]);

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

const ActiveDays = Type.Object({
  summary: {
    ...PeriodSummary,
    description:
      'Active days in the current period against the previous one. current, previous and changeValue are counts of days.',
  },
  avgContributionsPerDay: Type.Number({
    description:
      'Average number of contributions per active day in the current period (count per day). 0 when there are no active days.',
  }),
  data: Type.Array(ActiveDaysBucket, {
    description: 'One entry per granularity bucket in the current period.',
  }),
});

// The pipe takes DateTime parameters and returns its Date columns as YYYY-MM-DD.
const toTinybirdRange = (range: DateRange) => ({
  startDate: `${range.startDate} 00:00:00`,
  endDate: `${range.endDate} 00:00:00`,
});
const toUtcDateTime = (day: string) => `${day}T00:00:00Z`;

async function fetchRows<T>(client: TinybirdClient, params: TinybirdQuery): Promise<T[]> {
  try {
    const { data } = await client.fetch<T[]>(pipePath, params);
    return data;
  } catch (err: unknown) {
    // The client reports a slug with no bucket as not found. A metric endpoint answers an
    // unknown project with empty data, which is why ProjectSlugParams lets any slug through.
    if (err instanceof TinybirdProjectNotFoundError) {
      return [];
    }
    throw err;
  }
}

const activeDaysRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/active-days',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get active days',
        description:
          'Returns the number of days with at least one development activity in the period against the previous period, the average contributions per active day, and the contributions per bucket. The previous period has the same length and ends the day before `startDate`.',
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

      // Ajv turns a bare `repos=` into [''] and the client sends an empty array as `repos=`,
      // which the pipe would apply as a filter. The Nuxt handler drops an empty value too.
      const repoFilter = repos?.filter(Boolean);
      const shared = {
        project: slug,
        repos: repoFilter?.length ? repoFilter : undefined,
        includeCodeContributions: true,
        includeCollaborations,
      };
      const currentRange = toTinybirdRange(dates.current);
      const previousRange = toTinybirdRange(dates.previous);

      // A missing API_TB_* variable throws here, outside the catch, so it stays a 500.
      const client = getTinybirdClient();
      const [currentRows, previousRows, seriesRows] = await Promise.all([
        fetchRows<SummaryRow>(client, { ...shared, ...currentRange }),
        fetchRows<SummaryRow>(client, { ...shared, ...previousRange }),
        fetchRows<SeriesRow>(client, { ...shared, ...currentRange, granularity }),
      ]).catch((err: unknown) => {
        request.log.error({ err }, 'Tinybird active_days request failed');
        throw new UpstreamUnavailableError();
      });

      const current = currentRows[0];
      const previous = previousRows[0];
      return {
        summary: toPeriodSummary(
          current?.activeDaysCount ?? 0,
          previous?.activeDaysCount ?? 0,
          dates.current,
        ),
        avgContributionsPerDay: current?.avgContributionsPerDay ?? 0,
        data: seriesRows.map((row) => ({
          startDate: toUtcDateTime(row.startDate),
          endDate: toUtcDateTime(row.endDate),
          contributions: row.activityCount,
        })),
      };
    },
  );
};

export default activeDaysRoutes;
