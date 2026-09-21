// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { Type } from '@sinclair/typebox';
import type { FastifyBaseLogger } from 'fastify';
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

// The pipe declares both bucket bounds as Nullable(Date).
interface SeriesRow {
  startDate: string | null;
  endDate: string | null;
  activityCount?: number | null;
}

type BoundedSeriesRow = SeriesRow & { startDate: string; endDate: string };

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

// The shared PeriodSummary leaves current, previous and changeValue undescribed; the unit is
// per metric, so it is stated here.
const ActiveDaysSummary = Type.Object(
  {
    ...PeriodSummary.properties,
    current: Type.Number({ description: 'Active days in the current period (count of days).' }),
    previous: Type.Number({ description: 'Active days in the previous period (count of days).' }),
    changeValue: Type.Number({ description: 'current minus previous (count of days).' }),
  },
  {
    title: 'ActiveDaysSummary',
    description: 'Active days in the current period against the previous one.',
  },
);

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

// The pipe takes DateTime parameters and returns its Date columns as YYYY-MM-DD.
const toTinybirdRange = (range: DateRange) => ({
  startDate: `${range.startDate} 00:00:00`,
  endDate: `${range.endDate} 00:00:00`,
});

// Tinybird returns bucket bounds as Date columns (YYYY-MM-DD). Keeping the day means a DateTime
// column formats the same way, and the shape matches periodFrom/periodTo from toPeriodSummary.
const toUtcMidnight = (day: string) => `${day.slice(0, 10)}T00:00:00Z`;

// A bucket missing either bound has no place on the time axis and cannot meet the date-time
// contract, so it is left out instead of being formatted from null.
const hasBounds = (row: SeriesRow): row is BoundedSeriesRow =>
  typeof row.startDate === 'string' && typeof row.endDate === 'string';

// Every Tinybird failure becomes a 503, so Tinybird's own status never reaches the caller.
async function fromTinybird<T>(
  log: FastifyBaseLogger,
  pipe: string,
  call: () => Promise<T>,
): Promise<T> {
  try {
    return await call();
  } catch (err: unknown) {
    log.error({ err }, `Tinybird ${pipe} request failed`);
    throw new UpstreamUnavailableError();
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
          'Returns the number of days with at least one development activity in the period against the previous period, the average contributions per active day, and the contributions per bucket. The previous period ends the day before `startDate` and covers the same calendar span as the current period, counted in whole months plus remaining days the way the Insights UI does, so its number of days can differ around month ends. Without dates the period runs from 2010-01-01 to today. An unknown project returns zeros and an empty `data` list.',
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
      const log = request.log;

      // A missing API_TB_* variable throws here, outside fromTinybird, so it stays a 500.
      const client = getTinybirdClient();

      // Resolving the bucket here saves the client one lookup per pipe call. A project without a
      // bucket is unknown to Tinybird, which metric endpoints answer with empty data.
      const bucketId = await fromTinybird(log, 'project_buckets', () =>
        client.getBucketIdForProject(slug),
      );
      if (bucketId === null) {
        return {
          summary: toPeriodSummary(0, 0, dates.current),
          avgContributionsPerDay: 0,
          data: [],
        };
      }

      // Ajv turns a bare `repos=` into [''] and the client sends an empty array as `repos=`,
      // which the pipe would apply as a filter. The Nuxt handler drops an empty value too.
      const repoFilter = repos?.filter(Boolean);
      const shared: TinybirdQuery = {
        project: slug,
        bucketId,
        repos: repoFilter?.length ? repoFilter : undefined,
        includeCodeContributions: true,
        includeCollaborations,
      };
      const currentRange = toTinybirdRange(dates.current);
      const previousRange = toTinybirdRange(dates.previous);
      const activeDays = <T>(query: TinybirdQuery) =>
        fromTinybird(log, 'active_days', () => client.fetch<T>(pipePath, query));

      const [currentRows, previousRows, seriesRows] = await Promise.all([
        activeDays<SummaryRow[]>({ ...shared, ...currentRange }),
        activeDays<SummaryRow[]>({ ...shared, ...previousRange }),
        activeDays<SeriesRow[]>({ ...shared, ...currentRange, granularity }),
      ]);

      const current = currentRows.data[0];
      const previous = previousRows.data[0];
      return {
        summary: toPeriodSummary(
          current?.activeDaysCount ?? 0,
          previous?.activeDaysCount ?? 0,
          dates.current,
        ),
        avgContributionsPerDay: current?.avgContributionsPerDay ?? 0,
        data: seriesRows.data.filter(hasBounds).map((row) => ({
          startDate: toUtcMidnight(row.startDate),
          endDate: toUtcMidnight(row.endDate),
          contributions: row.activityCount ?? 0,
        })),
      };
    },
  );
};

export default activeDaysRoutes;
