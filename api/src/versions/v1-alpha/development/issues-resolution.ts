// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';

import { fetchPipe, repoFilter } from '../../../clients/tinybird.js';
import {
  resolvePeriods,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import { widgetRoutes } from '../../../lib/widget-scope.js';
import {
  CollectionSeriesQuery,
  nullableNumber,
  periodSummary,
  SeriesQuery,
} from '../../../schemas/common.js';

const issuesCountPath = '/v0/pipes/issues_count.json';
const resolveVelocityPath = '/v0/pipes/issues_average_resolve_velocity.json';

interface IssueCountSummaryRow {
  issueCount?: number;
}

interface IssueCountBucketRow extends IssueCountSummaryRow {
  startDate: string;
  endDate: string;
}

interface ResolveVelocityRow {
  averageIssueResolveVelocitySeconds?: number | null;
}

const IssuesResolutionSummary = Type.Object(
  {
    ...periodSummary({ measure: 'Issues closed', unit: 'count', kind: 'integer' }).properties,
    avgResolveTimeSeconds: nullableNumber(
      'Average time from opening to closing an issue, over the issues closed in the current period (seconds). Null when none was closed.',
    ),
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

function mergeBuckets(
  opened: IssueCountBucketRow[],
  closed: IssueCountBucketRow[],
): IssuesResolutionBucket[] {
  const buckets = new Map<string, IssuesResolutionBucket>();
  const bucketFor = ({ startDate, endDate }: IssueCountBucketRow) => {
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
  for (const row of opened) bucketFor(row).totalIssues = row.issueCount ?? 0;
  for (const row of closed) bucketFor(row).closedIssues = row.issueCount ?? 0;
  return [...buckets.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

const measures =
  'Returns the issues closed in the period against the comparison period before it, the average time to resolve an issue in seconds, and the issues opened and closed in each bucket. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`.';

const issuesResolutionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  widgetRoutes(scope, {
    path: 'development/issues-resolution',
    tags: ['Development'],
    summary: 'Get issue resolution',
    project: {
      description: measures + ' An unknown project returns zero counts and an empty `data` list.',
      querystring: SeriesQuery,
      response: IssuesResolution,
    },
    collection: {
      description: measures,
      querystring: CollectionSeriesQuery,
      response: IssuesResolution,
    },
    handler: async (request, withTarget) => {
      const { repos, startDate, endDate, granularity } = request.query;
      const { current, previous } = resolvePeriods(startDate, endDate);

      const rows = await withTarget((target) => {
        const filter: TinybirdQuery = {
          ...target,
          repos: repoFilter(repos),
          countType: 'new',
          onlyContributions: false,
          includeCodeContributions: true,
          includeCollaborations: true,
          ...toTinybirdRange({ startDate, endDate }),
        };
        // issues_count counts each issue once, from the issue lifecycle data, so an issue closed by
        // a bot (e.g. a stale bot) still counts as closed.
        const closedFilter = { ...filter, state: 'closed' };
        const count = (query: TinybirdQuery) =>
          fetchPipe<IssueCountSummaryRow>(request, issuesCountPath, query);
        const series = (query: TinybirdQuery) =>
          fetchPipe<IssueCountBucketRow>(request, issuesCountPath, query, hasBucketBounds);

        return Promise.all([
          count(closedFilter),
          count({ ...closedFilter, ...toTinybirdRange(previous) }),
          series({ ...filter, state: 'opened', granularity }),
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
            currentSummary[0]?.issueCount ?? 0,
            previousSummary[0]?.issueCount ?? 0,
            current,
          ),
          avgResolveTimeSeconds: velocity[0]?.averageIssueResolveVelocitySeconds ?? null,
        },
        data: mergeBuckets(opened, closed),
      };
    },
  });
};

export default issuesResolutionRoutes;
