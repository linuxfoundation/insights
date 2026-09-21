// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';
import { ActivityTypes } from '@lfx-insights/types';
import { TinybirdInvalidResponseError, type TinybirdResponse } from '@lfx-insights/tinybird-client';
import { getTinybirdClient } from '../../../clients/tinybird.js';
import { UpstreamUnavailableError } from '../../../lib/errors.js';
import { getPreviousDates, toPeriodSummary, type DateRange } from '../../../lib/period.js';
import {
  DateRangeQuery,
  Granularity,
  PeriodSummary,
  ProjectSlugParams,
} from '../../../schemas/common.js';

interface SummaryRow {
  activityCount?: number;
}

interface SeriesRow {
  startDate: string;
  endDate: string;
  activityCount?: number;
  cumulativeActivityCount?: number;
}

const CommitActivitiesQuery = Type.Object({
  ...DateRangeQuery.properties,
  granularity: Type.Unsafe<Static<typeof Granularity>>({
    ...Granularity,
    description: 'Width of each bucket in `data`.',
  }),
  countType: Type.Optional(
    Type.Unsafe<'new' | 'cumulative'>({
      type: 'string',
      enum: ['new', 'cumulative'],
      default: 'new',
      description:
        '`new` counts the commits made in each bucket; `cumulative` gives the running total up to the end of each bucket.',
    }),
  ),
});

const CommitSummary = Type.Object(
  {
    current: Type.Integer({ description: 'Commits in the current period (count).' }),
    previous: Type.Integer({
      description:
        'Commits in the comparison period, which ends the day before `periodFrom`. Its span is derived in calendar months and days, so its elapsed days can differ from the current period (count).',
    }),
    percentageChange: PeriodSummary.properties.percentageChange,
    changeValue: Type.Integer({ description: 'current minus previous (count of commits).' }),
    periodFrom: PeriodSummary.properties.periodFrom,
    periodTo: PeriodSummary.properties.periodTo,
  },
  { description: 'Commit totals for the current period against the previous one.' },
);

const CommitActivities = Type.Object({
  summary: CommitSummary,
  data: Type.Array(
    Type.Object({
      startDate: Type.String({ format: 'date-time', description: 'Start of the bucket, UTC.' }),
      endDate: Type.String({ format: 'date-time', description: 'End of the bucket, UTC.' }),
      commits: Type.Integer({
        description:
          'Commits in the bucket, or the running total up to its end when countType=cumulative (count).',
      }),
    }),
    { description: 'One row per time bucket of the requested granularity.' },
  ),
});

// The pipes take DateTime parameters, so each calendar day is sent as its UTC midnight.
const toTinybirdRange = (range: DateRange): DateRange => ({
  startDate: `${range.startDate} 00:00:00`,
  endDate: `${range.endDate} 00:00:00`,
});

// Tinybird returns Date columns as YYYY-MM-DD and DateTime columns as YYYY-MM-DD HH:mm:ss, both UTC.
const toUtcDateTime = (value: string) =>
  value.includes(' ') ? `${value.replace(' ', 'T')}Z` : `${value}T00:00:00Z`;

// The client only checks that `data` is present, so a pipe answering outside its contract is
// rejected here and maps to 503 with the other upstream faults.
function rowsOf<T>(response: TinybirdResponse<T[]>, isRow: (row: T) => boolean = () => true): T[] {
  if (!Array.isArray(response.data) || !response.data.every(isRow)) {
    throw new TinybirdInvalidResponseError('Tinybird returned rows of an unexpected shape');
  }
  return response.data;
}

const hasBucketDates = (row: SeriesRow) =>
  typeof row.startDate === 'string' && typeof row.endDate === 'string';

const commitActivityRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/commit-activities',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get commit activities',
        description:
          'Returns commit counts per time bucket of the requested granularity, as new commits in each bucket or as a cumulative total, plus a summary comparing the current period with the comparison period before it. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: CommitActivitiesQuery,
        response: { 200: CommitActivities },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity, countType = 'new' } = request.query;
      // Throws a 400 on an inverted range, so it runs before any Tinybird call.
      const { current, previous } = getPreviousDates(startDate, endDate);
      const client = getTinybirdClient();
      const upstreamUnavailable = (err: unknown): never => {
        request.log.error({ err }, 'Tinybird commit activities request failed');
        throw new UpstreamUnavailableError();
      };

      // One lookup here; passing bucketId to every pipe call stops the client repeating it.
      const bucketId = await client.getBucketIdForProject(slug).catch(upstreamUnavailable);
      if (bucketId === null) {
        return { summary: toPeriodSummary(0, 0, current), data: [] };
      }

      const common = {
        project: slug,
        bucketId,
        repos,
        activity_type: ActivityTypes.AUTHORED_COMMIT,
        onlyContributions: true,
        includeCodeContributions: true,
        includeCollaborations: false,
      };
      // The resolved range goes to the pipes so what they count matches periodFrom/periodTo.
      const currentRange = toTinybirdRange(current);
      const isCumulative = countType === 'cumulative';
      const seriesPipe = isCumulative ? 'activities_cumulative_count' : 'activities_count';

      const [currentRows, previousRows, seriesRows] = await Promise.all([
        client
          .fetch<SummaryRow[]>('/v0/pipes/activities_count.json', {
            ...common,
            ...currentRange,
          })
          .then((response) => rowsOf(response)),
        client
          .fetch<SummaryRow[]>('/v0/pipes/activities_count.json', {
            ...common,
            ...toTinybirdRange(previous),
          })
          .then((response) => rowsOf(response)),
        client
          .fetch<SeriesRow[]>(`/v0/pipes/${seriesPipe}.json`, {
            ...common,
            ...currentRange,
            granularity,
          })
          .then((response) => rowsOf(response, hasBucketDates)),
      ]).catch(upstreamUnavailable);

      return {
        summary: toPeriodSummary(
          currentRows[0]?.activityCount ?? 0,
          previousRows[0]?.activityCount ?? 0,
          current,
        ),
        data: seriesRows.map((row) => ({
          startDate: toUtcDateTime(row.startDate),
          endDate: toUtcDateTime(row.endDate),
          commits: (isCumulative ? row.cumulativeActivityCount : row.activityCount) ?? 0,
        })),
      };
    },
  );
};

export default commitActivityRoutes;
