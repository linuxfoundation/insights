// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';
import { ActivityTypes } from '@lfx-insights/types';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import { periodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

const activitiesCountPath = '/v0/pipes/activities_count.json';
const resolveVelocityPath = '/v0/pipes/issues_average_resolve_velocity.json';

// activities_count answers with one summary row without granularity and one row per bucket with it.
interface ActivityCountSummaryRow {
  activityCount?: number;
}

interface ActivityCountBucketRow extends ActivityCountSummaryRow {
  startDate: string;
  endDate: string;
}

interface ResolveVelocityRow {
  averageIssueResolveVelocitySeconds?: number | null;
}

const IssuesResolutionSummary = Type.Object(
  {
    ...periodSummary({ measure: 'Issues closed', unit: 'count', kind: 'integer' }).properties,
    avgResolveTimeSeconds: Type.Unsafe<number | null>({
      type: 'number',
      nullable: true,
      description:
        'Average time from opening to closing an issue, over the issues closed in the current period (seconds). Null when none was closed.',
    }),
  },
  {
    title: 'IssuesResolutionSummary',
    description:
      'Closed issues in the current period against the previous one, plus the average resolve time.',
  },
);

const IssuesResolutionBucket = Type.Object({
  startDate: Type.String({
    format: 'date-time',
    description: 'First day of the bucket, at UTC midnight.',
  }),
  endDate: Type.String({
    format: 'date-time',
    description: 'Last day of the bucket, at UTC midnight.',
  }),
  totalIssues: Type.Number({ description: 'Issues opened in the bucket (count).' }),
  closedIssues: Type.Number({ description: 'Issues closed in the bucket (count).' }),
});
type IssuesResolutionBucket = Static<typeof IssuesResolutionBucket>;

const IssuesResolution = Type.Object({
  summary: IssuesResolutionSummary,
  data: Type.Array(IssuesResolutionBucket, {
    description: 'One entry per bucket, ascending by `startDate`.',
  }),
});

// A bucket seen in either series gets an entry, with 0 for the series it is missing from.
function mergeBuckets(
  opened: ActivityCountBucketRow[],
  closed: ActivityCountBucketRow[],
): IssuesResolutionBucket[] {
  const buckets = new Map<string, IssuesResolutionBucket>();
  const bucketFor = ({ startDate, endDate }: ActivityCountBucketRow) => {
    const key = `${startDate}|${endDate}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        startDate: toIsoUtc(startDate),
        endDate: toIsoUtc(endDate),
        totalIssues: 0,
        closedIssues: 0,
      };
      buckets.set(key, bucket);
    }
    return bucket;
  };
  for (const row of opened) bucketFor(row).totalIssues = row.activityCount ?? 0;
  for (const row of closed) bucketFor(row).closedIssues = row.activityCount ?? 0;
  return [...buckets.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

const issuesResolutionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/issues-resolution',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get issue resolution',
        description:
          'Returns the issues closed in the period against the comparison period before it, the average time to resolve an issue in seconds, and the issues opened and closed in each bucket. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: SeriesQuery,
        response: { 200: IssuesResolution },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity } = request.query;
      const { current, previous } = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        // The filter the Nuxt widget handler sends; countType 'new' is ActivityFilterCountType.NEW.
        // The current-period calls forward the query's own bounds, so an omitted date stays omitted.
        const filter: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          countType: 'new',
          onlyContributions: false,
          includeCodeContributions: true,
          includeCollaborations: true,
          ...toTinybirdRange({ startDate, endDate }),
        };
        const closedFilter = { ...filter, activity_type: ActivityTypes.ISSUES_CLOSED };
        const count = (query: TinybirdQuery) =>
          fetchPipe<ActivityCountSummaryRow>(request, activitiesCountPath, query);
        const series = (query: TinybirdQuery) =>
          fetchPipe<ActivityCountBucketRow>(request, activitiesCountPath, query, hasBucketBounds);

        return Promise.all([
          count(closedFilter),
          count({ ...closedFilter, ...toTinybirdRange(previous) }),
          series({ ...filter, activity_type: ActivityTypes.ISSUES_OPENED, granularity }),
          series({ ...closedFilter, granularity }),
          fetchPipe<ResolveVelocityRow>(request, resolveVelocityPath, filter),
        ]);
      });
      if (!rows) {
        return {
          summary: { ...toPeriodSummary(0, 0, current), avgResolveTimeSeconds: null },
          data: [],
        };
      }

      const [currentSummary, previousSummary, opened, closed, velocity] = rows;
      return {
        summary: {
          ...toPeriodSummary(
            currentSummary[0]?.activityCount ?? 0,
            previousSummary[0]?.activityCount ?? 0,
            current,
          ),
          avgResolveTimeSeconds: velocity[0]?.averageIssueResolveVelocitySeconds ?? null,
        },
        data: mergeBuckets(opened, closed),
      };
    },
  );
};

export default issuesResolutionRoutes;
