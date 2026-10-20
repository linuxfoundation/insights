// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';

import { fetchPipe, repoFilter } from '../../../clients/tinybird.js';
import {
  resolvePeriods,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
  type DateRange,
} from '../../../lib/period.js';
import { widgetRoutes } from '../../../lib/widget-scope.js';
import {
  CollectionSeriesQuery,
  nullableNumber,
  periodSummary,
  SeriesQuery,
} from '../../../schemas/common.js';

interface SummaryRow {
  pullRequestCount?: number;
}

interface SeriesRow extends SummaryRow {
  startDate: string;
  endDate: string;
}

interface VelocityRow {
  averagePullRequestResolveVelocitySeconds?: number | null;
}

interface PipeRows {
  openedCurrent: SummaryRow[];
  openedPrevious: SummaryRow[];
  mergedCurrent: SummaryRow[];
  mergedPrevious: SummaryRow[];
  closedCurrent: SummaryRow[];
  closedPrevious: SummaryRow[];
  openedSeries: SeriesRow[];
  mergedSeries: SeriesRow[];
  closedSeries: SeriesRow[];
  velocity: VelocityRow[];
}

const countPath = '/v0/pipes/pull_requests_count.json';
const velocityPath = '/v0/pipes/pull_requests_average_resolve_velocity.json';

// The lifecycle timestamp pull_requests_count counts by. It counts each pull request once, from the
// PR lifecycle data, so a merge done by a bot account still counts as merged.
type PullRequestState = 'opened' | 'merged' | 'closed';

const pullRequestSummary = (title: string, verb: string) =>
  periodSummary({
    measure: `Pull requests ${verb}`,
    unit: 'count',
    kind: 'integer',
    title,
    description: `Pull requests ${verb} in the current period against the comparison period before it.`,
  });

const PullRequests = Type.Object({
  openedSummary: pullRequestSummary('PullRequestsOpenedSummary', 'opened'),
  mergedSummary: pullRequestSummary('PullRequestsMergedSummary', 'merged'),
  closedSummary: pullRequestSummary('PullRequestsClosedSummary', 'closed'),
  avgResolveTimeSeconds: nullableNumber(
    'Average time to resolve a pull request in the current period, in seconds. Null when no pull request was resolved.',
  ),
  data: Type.Array(
    Type.Object({
      startDate: Type.String({ format: 'date-time', description: 'Start of the bucket (UTC).' }),
      endDate: Type.String({ format: 'date-time', description: 'End of the bucket (UTC).' }),
      open: Type.Integer({ description: 'Pull requests opened in the bucket (count).' }),
      merged: Type.Integer({ description: 'Pull requests merged in the bucket (count).' }),
      closed: Type.Integer({ description: 'Pull requests closed in the bucket (count).' }),
    }),
    {
      description:
        'One entry per bucket the pipes report, ascending by `startDate`. A bucket with no reported activity may be omitted.',
    },
  ),
});
type PullRequests = Static<typeof PullRequests>;
type Bucket = PullRequests['data'][number];

function toPullRequests(rows: PipeRows, current: DateRange): PullRequests {
  const summarize = (currentRows: SummaryRow[], previousRows: SummaryRow[]) =>
    toPeriodSummary(
      currentRows[0]?.pullRequestCount ?? 0,
      previousRows[0]?.pullRequestCount ?? 0,
      current,
    );

  // A series may leave out empty buckets, so every bucket start any series reports gets an entry,
  // with 0 for a missing count.
  const buckets = new Map<string, Bucket>();
  const merge = (series: SeriesRow[], count: 'open' | 'merged' | 'closed') => {
    for (const row of series) {
      const startDate = toIsoUtc(row.startDate);
      const bucket = buckets.get(startDate) ?? {
        startDate,
        endDate: toIsoUtc(row.endDate),
        open: 0,
        merged: 0,
        closed: 0,
      };
      bucket[count] = row.pullRequestCount ?? 0;
      buckets.set(startDate, bucket);
    }
  };
  merge(rows.openedSeries, 'open');
  merge(rows.mergedSeries, 'merged');
  merge(rows.closedSeries, 'closed');

  return {
    openedSummary: summarize(rows.openedCurrent, rows.openedPrevious),
    mergedSummary: summarize(rows.mergedCurrent, rows.mergedPrevious),
    closedSummary: summarize(rows.closedCurrent, rows.closedPrevious),
    avgResolveTimeSeconds: rows.velocity[0]?.averagePullRequestResolveVelocitySeconds ?? null,
    data: [...buckets.values()].sort((a, b) => a.startDate.localeCompare(b.startDate)),
  };
}

const measures =
  'Returns the pull requests opened, merged and closed in the period against the comparison period before it, the average time to resolve one in seconds, and the opened, merged and closed counts per bucket. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`.';

const pullRequestRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  widgetRoutes(scope, {
    path: 'development/pull-requests',
    tags: ['Development'],
    summary: 'Get pull request activity',
    project: {
      description:
        measures +
        ' An unknown project returns zero counts and an empty `data` list after the project lookup alone; a known project makes up to 11 Tinybird calls: ten concurrent pipe queries, plus one project lookup when the process has no cached bucket for the slug.',
      querystring: SeriesQuery,
      response: PullRequests,
    },
    collection: {
      description: measures,
      querystring: CollectionSeriesQuery,
      response: PullRequests,
    },
    handler: async (request, withTarget) => {
      const { startDate, endDate, repos, granularity } = request.query;
      const { current, previous } = resolvePeriods(startDate, endDate);

      const rows = await withTarget(async (target): Promise<PipeRows> => {
        const base = {
          ...target,
          repos: repoFilter(repos),
          onlyContributions: false,
          includeCodeContributions: true,
          includeCollaborations: true,
        };
        const currentRange = toTinybirdRange(current);
        const previousRange = toTinybirdRange(previous);
        const countPullRequests = (state: PullRequestState, range: Partial<DateRange>) =>
          fetchPipe<SummaryRow>(request, countPath, { ...base, ...range, state });
        const bucketPullRequests = (state: PullRequestState) =>
          fetchPipe<SeriesRow>(
            request,
            countPath,
            { ...base, ...currentRange, state, granularity },
            hasBucketBounds,
          );

        const [
          openedCurrent,
          openedPrevious,
          mergedCurrent,
          mergedPrevious,
          closedCurrent,
          closedPrevious,
          openedSeries,
          mergedSeries,
          closedSeries,
          velocity,
        ] = await Promise.all([
          countPullRequests('opened', currentRange),
          countPullRequests('opened', previousRange),
          countPullRequests('merged', currentRange),
          countPullRequests('merged', previousRange),
          countPullRequests('closed', currentRange),
          countPullRequests('closed', previousRange),
          bucketPullRequests('opened'),
          bucketPullRequests('merged'),
          bucketPullRequests('closed'),
          fetchPipe<VelocityRow>(request, velocityPath, { ...base, ...currentRange }),
        ]);
        return {
          openedCurrent,
          openedPrevious,
          mergedCurrent,
          mergedPrevious,
          closedCurrent,
          closedPrevious,
          openedSeries,
          mergedSeries,
          closedSeries,
          velocity,
        };
      });
      if (!rows) {
        const none = toPeriodSummary(0, 0, current);
        return {
          openedSummary: none,
          mergedSummary: none,
          closedSummary: none,
          avgResolveTimeSeconds: null,
          data: [],
        };
      }
      return toPullRequests(rows, current);
    },
  });
};

export default pullRequestRoutes;
