// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';
import type { TinybirdClient } from '@lfx-insights/tinybird-client';
import { ActivityTypes, Granularity as SharedGranularity } from '@lfx-insights/types';
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

const defaultGranularity = SharedGranularity.WEEKLY;

// Type.Unsafe keeps the Kind symbol and merges its options, so spreading the shared schema adds
// a default and a description without redefining the enum.
const GranularityQuery = Type.Unsafe<Static<typeof Granularity>>({
  ...Granularity,
  default: defaultGranularity,
  description: 'Bucket size of the series. Defaults to weekly.',
});

const PullRequestsQuery = Type.Object({
  ...DateRangeQuery.properties,
  granularity: Type.Optional(GranularityQuery),
});

const summaryOf = (description: string): typeof PeriodSummary => ({
  ...PeriodSummary,
  description,
});

const PullRequests = Type.Object({
  openedSummary: summaryOf(
    'Pull requests opened in the current period (count), against the previous period of the same length.',
  ),
  mergedSummary: summaryOf(
    'Pull requests merged in the current period (count), against the previous period of the same length.',
  ),
  closedSummary: summaryOf(
    'Pull requests closed in the current period (count), against the previous period of the same length.',
  ),
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
    { description: 'One entry per granularity bucket of the current period.' },
  ),
});
type PullRequests = Static<typeof PullRequests>;
type Bucket = PullRequests['data'][number];

interface PullRequestsRequest {
  slug: string;
  repos?: string[];
  granularity: Static<typeof Granularity>;
  current: DateRange;
  previous: DateRange;
}

// The pipes take DateTime parameters, so each calendar day is sent as its UTC midnight.
const toTinybirdRange = (range: DateRange): DateRange => ({
  startDate: `${range.startDate} 00:00:00`,
  endDate: `${range.endDate} 00:00:00`,
});

// The pipe returns bucket bounds as ClickHouse Date or DateTime text. Both take the T..Z shape
// toPeriodSummary writes, so every date in the body has one format.
function toIsoUtc(value: string): string {
  const [day, time = '00:00:00'] = value.split(' ');
  return `${day}T${time}Z`;
}

// Resolves to null for a slug Tinybird has no bucket for, so the route answers with empty data.
async function queryPipes(
  client: TinybirdClient,
  { slug, repos, granularity, current, previous }: PullRequestsRequest,
): Promise<PipeRows | null> {
  // The client resolves a bucket before every query that carries `project` and throws when
  // none exists. Resolving it once turns an unknown slug into empty data and cuts the calls
  // from 20 to 11.
  const bucketId = await client.getBucketIdForProject(slug);
  if (bucketId === null) {
    return null;
  }

  // Ajv coerces `?repos=` into [''], which Tinybird would read as a filter matching nothing.
  const repoFilter = repos?.filter(Boolean);
  const base = {
    project: slug,
    bucketId,
    repos: repoFilter?.length ? repoFilter : undefined,
    onlyContributions: false,
    includeCodeContributions: true,
    includeCollaborations: true,
  };
  const currentRange = toTinybirdRange(current);
  const previousRange = toTinybirdRange(previous);
  const countActivities = (activityTypes: ActivityTypes[], range: DateRange) =>
    client
      .fetch<SummaryRow[]>(activitiesPath, { ...base, ...range, activity_types: activityTypes })
      .then((response) => response.data);
  const bucketActivities = (activityTypes: ActivityTypes[]) =>
    client
      .fetch<SeriesRow[]>(activitiesPath, {
        ...base,
        ...currentRange,
        activity_types: activityTypes,
        granularity,
      })
      .then((response) => response.data);

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
    client
      .fetch<VelocityRow[]>(velocityPath, { ...base, ...currentRange })
      .then((response) => response.data),
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
}

function toPullRequests(rows: PipeRows | null, current: DateRange): PullRequests {
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
          'Returns how many pull requests were opened, merged and closed in the period against the previous period of the same length, the average time to resolve one, and the opened, merged and closed counts per granularity bucket. Each request makes 11 Tinybird calls: one project lookup and ten concurrent pipe queries.',
        params: ProjectSlugParams,
        querystring: PullRequestsQuery,
        response: { 200: PullRequests },
      },
    },
    async (request) => {
      const { slug } = request.params;
      // Ajv fills the schema default; the fallback only narrows the type for TypeScript.
      const { startDate, endDate, repos, granularity = defaultGranularity } = request.query;
      // A bad range is a 400, so it is checked before the 503 mapping below can catch it.
      const { current, previous } = getPreviousDates(startDate, endDate);
      const client = getTinybirdClient();

      // Only the Tinybird calls map to 503; a missing client config or a reshaping defect
      // stays a 500.
      const rows = await queryPipes(client, { slug, repos, granularity, current, previous }).catch(
        (err: unknown) => {
          request.log.error({ err }, 'Tinybird pull requests request failed');
          throw new UpstreamUnavailableError();
        },
      );
      return toPullRequests(rows, current);
    },
  );
};

export default pullRequestRoutes;
