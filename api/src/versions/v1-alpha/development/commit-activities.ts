// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { ActivityTypes } from '@lfx-insights/types';
import { fetchPipe, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import { periodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

interface SummaryRow {
  activityCount?: number;
}

interface SeriesRow {
  startDate: string;
  endDate: string;
  activityCount?: number;
  cumulativeActivityCount?: number;
}

const activitiesCountPath = '/v0/pipes/activities_count.json';

const CommitActivitiesQuery = Type.Object({
  ...SeriesQuery.properties,
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

const CommitSummary = periodSummary({
  measure: 'Commits',
  unit: 'count',
  kind: 'integer',
  description: 'Commit totals for the current period against the previous one.',
});

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

const commitActivityRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/commit-activities',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get commit activities',
        description:
          'Returns commit counts per time bucket of the requested granularity, as new commits in each bucket or as a cumulative total, plus a summary comparing the current period with the comparison period before it. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list.',
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
      const isCumulative = countType === 'cumulative';

      const rows = await withBucket(request, slug, (bucketId) => {
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
        const seriesPipe = isCumulative ? 'activities_cumulative_count' : 'activities_count';

        return Promise.all([
          fetchPipe<SummaryRow>(request, activitiesCountPath, { ...common, ...currentRange }),
          fetchPipe<SummaryRow>(request, activitiesCountPath, {
            ...common,
            ...toTinybirdRange(previous),
          }),
          fetchPipe<SeriesRow>(
            request,
            `/v0/pipes/${seriesPipe}.json`,
            { ...common, ...currentRange, granularity },
            hasBucketBounds,
          ),
        ]);
      });
      if (!rows) {
        return { summary: toPeriodSummary(0, 0, current), data: [] };
      }

      const [currentRows, previousRows, seriesRows] = rows;
      return {
        summary: toPeriodSummary(
          currentRows[0]?.activityCount ?? 0,
          previousRows[0]?.activityCount ?? 0,
          current,
        ),
        data: seriesRows.map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          commits: (isCumulative ? row.cumulativeActivityCount : row.activityCount) ?? 0,
        })),
      };
    },
  );
};

export default commitActivityRoutes;
