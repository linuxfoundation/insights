// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';
import { ActivityTypes } from '@lfx-insights/types';
import { getTinybirdClient } from '../../../clients/tinybird.js';
import { UpstreamUnavailableError } from '../../../lib/errors.js';
import { getPreviousDates, toPeriodSummary } from '../../../lib/period.js';
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
      description: 'Commits in the previous period of the same length (count).',
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

// Tinybird DateTime parameters are written with a space between the day and the time.
const tinybirdDay = (day: string) => `${day} 00:00:00`;

// Tinybird returns Date columns as YYYY-MM-DD and DateTime columns as YYYY-MM-DD HH:mm:ss, both UTC.
const toUtcDateTime = (value: string) =>
  value.includes(' ') ? `${value.replace(' ', 'T')}Z` : `${value}T00:00:00Z`;

const commitActivityRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/commit-activities',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get commit activities',
        description:
          'Returns commit counts per time bucket of the requested granularity, as new commits in each bucket or as a cumulative total, plus a summary comparing the current period with the previous period of the same length. The previous period ends the day before `startDate`.',
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
      // The pipes apply their own defaults when a date is absent, so the caller's omission is forwarded as is.
      const currentRange = {
        startDate: startDate && tinybirdDay(startDate),
        endDate: endDate && tinybirdDay(endDate),
      };
      const isCumulative = countType === 'cumulative';
      const seriesPipe = isCumulative ? 'activities_cumulative_count' : 'activities_count';

      const [currentSummary, previousSummary, series] = await Promise.all([
        client.fetch<SummaryRow[]>('/v0/pipes/activities_count.json', {
          ...common,
          ...currentRange,
        }),
        client.fetch<SummaryRow[]>('/v0/pipes/activities_count.json', {
          ...common,
          startDate: tinybirdDay(previous.startDate),
          endDate: tinybirdDay(previous.endDate),
        }),
        client.fetch<SeriesRow[]>(`/v0/pipes/${seriesPipe}.json`, {
          ...common,
          ...currentRange,
          granularity,
        }),
      ]).catch(upstreamUnavailable);

      return {
        summary: toPeriodSummary(
          currentSummary.data[0]?.activityCount ?? 0,
          previousSummary.data[0]?.activityCount ?? 0,
          current,
        ),
        data: series.data.map((row) => ({
          startDate: toUtcDateTime(row.startDate),
          endDate: toUtcDateTime(row.endDate),
          commits: (isCumulative ? row.cumulativeActivityCount : row.activityCount) ?? 0,
        })),
      };
    },
  );
};

export default commitActivityRoutes;
