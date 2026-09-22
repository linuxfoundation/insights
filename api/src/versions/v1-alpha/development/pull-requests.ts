// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';

import { ActivityTypes } from '@lfx-insights/types';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
  type DateRange,
} from '../../../lib/period.js';
import { periodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

interface SummaryRow {
  activityCount?: number;
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

const activitiesPath = '/v0/pipes/activities_count.json';
const velocityPath = '/v0/pipes/pull_requests_average_resolve_velocity.json';

const openedTypes = [
  ActivityTypes.PULL_REQUEST_OPENED,
  ActivityTypes.MERGE_REQUEST_OPENED,
  ActivityTypes.CHANGESET_CREATED,
];
const mergedTypes = [
  ActivityTypes.PULL_REQUEST_MERGED,
  ActivityTypes.MERGE_REQUEST_MERGED,
  ActivityTypes.CHANGESET_MERGED,
];
const closedTypes = [
  ActivityTypes.PULL_REQUEST_CLOSED,
  ActivityTypes.MERGE_REQUEST_CLOSED,
  ActivityTypes.CHANGESET_CLOSED,
  ActivityTypes.CHANGESET_ABANDONED,
];

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
  avgResolveTimeSeconds: Type.Unsafe<number | null>({
    type: 'number',
    nullable: true,
    description:
      'Average time to resolve a pull request in the current period, in seconds. Null when no pull request was resolved.',
  }),
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
      currentRows[0]?.activityCount ?? 0,
      previousRows[0]?.activityCount ?? 0,
      current,
    );

  // Whether the pipe emits a row for an empty bucket is undocumented, so the output covers every
  // bucket start any series reports, keyed by its normalised value, and a missing count is 0.
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
      bucket[count] = row.activityCount ?? 0;
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

const pullRequestRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/pull-requests',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get pull request activity',
        description:
          'Returns the pull requests opened, merged and closed in the period against the comparison period before it, the average time to resolve one in seconds, and the opened, merged and closed counts per bucket. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list after the project lookup alone; a known project makes up to 11 Tinybird calls: ten concurrent pipe queries, plus one project lookup when the process has no cached bucket for the slug.',
        params: ProjectSlugParams,
        querystring: SeriesQuery,
        response: { 200: PullRequests },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { startDate, endDate, repos, granularity } = request.query;
      // A bad range is a 400, so it is checked before the 503 mapping can catch it.
      const { current, previous } = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, async (bucketId): Promise<PipeRows> => {
        const base = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          onlyContributions: false,
          includeCodeContributions: true,
          includeCollaborations: true,
        };
        const currentRange = toTinybirdRange(current);
        const previousRange = toTinybirdRange(previous);
        const countActivities = (activityTypes: ActivityTypes[], range: Partial<DateRange>) =>
          fetchPipe<SummaryRow>(request, activitiesPath, {
            ...base,
            ...range,
            activity_types: activityTypes,
          });
        const bucketActivities = (activityTypes: ActivityTypes[]) =>
          fetchPipe<SeriesRow>(
            request,
            activitiesPath,
            { ...base, ...currentRange, activity_types: activityTypes, granularity },
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
          countActivities(openedTypes, currentRange),
          countActivities(openedTypes, previousRange),
          countActivities(mergedTypes, currentRange),
          countActivities(mergedTypes, previousRange),
          countActivities(closedTypes, currentRange),
          countActivities(closedTypes, previousRange),
          bucketActivities(openedTypes),
          bucketActivities(mergedTypes),
          bucketActivities(closedTypes),
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
  );
};

export default pullRequestRoutes;
