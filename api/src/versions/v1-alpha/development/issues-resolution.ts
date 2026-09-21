// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static, type TSchema } from '@sinclair/typebox';
import type { FastifyBaseLogger } from 'fastify';
import { ActivityTypes } from '@lfx-insights/types';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { getTinybirdClient } from '../../../clients/tinybird.js';
import { UpstreamUnavailableError } from '../../../lib/errors.js';
import { getPreviousDates, toPeriodSummary } from '../../../lib/period.js';
import {
  DateRangeQuery,
  Granularity,
  PeriodSummary,
  ProjectSlugParams,
} from '../../../schemas/common.js';

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

// Keeps the shared schema as the source of the field's type and adds the endpoint's wording.
const describe = <T extends TSchema>(schema: T, description: string): T => ({
  ...schema,
  description,
});

const IssuesResolutionQuery = Type.Object({
  ...DateRangeQuery.properties,
  granularity: describe(Granularity, 'Width of each entry in `data`.'),
});

// PeriodSummary leaves its count fields undescribed, so each endpoint says what it counts.
const IssuesResolutionSummary = Type.Object(
  {
    ...PeriodSummary.properties,
    current: describe(
      PeriodSummary.properties.current,
      'Issues closed in the current period (count).',
    ),
    previous: describe(
      PeriodSummary.properties.previous,
      'Issues closed in the previous period, which has the same length and ends the day before `periodFrom` (count).',
    ),
    changeValue: describe(
      PeriodSummary.properties.changeValue,
      '`current` minus `previous` (count).',
    ),
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

// The Nuxt data layer formats Luxon dates for these pipes as 'yyyy-MM-dd 00:00:00'.
const toTinybirdDay = (day?: string) => (day === undefined ? undefined : `${day} 00:00:00`);

// Tinybird returns bucket bounds as Date columns (YYYY-MM-DD). Keeping the day means a DateTime
// column formats the same way, and the shape matches periodFrom/periodTo from toPeriodSummary.
const toUtcMidnight = (day: string) => `${day.slice(0, 10)}T00:00:00Z`;

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
        startDate: toUtcMidnight(startDate),
        endDate: toUtcMidnight(endDate),
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
          'Returns the issues closed in the period against the previous period of the same length, the average time to resolve an issue in seconds, and the issues opened and closed in each bucket. The previous period ends the day before `startDate`. Without dates the period runs from 2010-01-01 to today. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: IssuesResolutionQuery,
        response: { 200: IssuesResolution },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity } = request.query;
      const { current, previous } = getPreviousDates(startDate, endDate);
      const client = getTinybirdClient();
      const log = request.log;

      // Resolving the bucket here saves the client one lookup per pipe call. A project without a
      // bucket is unknown to Tinybird, which metric endpoints answer with empty data.
      const bucketId = await fromTinybird(log, 'project_buckets', () =>
        client.getBucketIdForProject(slug),
      );
      if (bucketId === null) {
        return {
          summary: { ...toPeriodSummary(0, 0, current), avgResolveTimeSeconds: null },
          data: [],
        };
      }

      // The filter the Nuxt widget handler sends; countType 'new' is ActivityFilterCountType.NEW.
      const filter: TinybirdQuery = {
        project: slug,
        bucketId,
        repos,
        countType: 'new',
        onlyContributions: false,
        includeCodeContributions: true,
        includeCollaborations: true,
        startDate: toTinybirdDay(startDate),
        endDate: toTinybirdDay(endDate),
      };
      const closedFilter = { ...filter, activity_type: ActivityTypes.ISSUES_CLOSED };
      const activities = <T>(query: TinybirdQuery) =>
        fromTinybird(log, 'activities_count', () => client.fetch<T>(activitiesCountPath, query));

      const [currentSummary, previousSummary, opened, closed, velocity] = await Promise.all([
        activities<ActivityCountSummaryRow[]>(closedFilter),
        activities<ActivityCountSummaryRow[]>({
          ...closedFilter,
          startDate: toTinybirdDay(previous.startDate),
          endDate: toTinybirdDay(previous.endDate),
        }),
        activities<ActivityCountBucketRow[]>({
          ...filter,
          activity_type: ActivityTypes.ISSUES_OPENED,
          granularity,
        }),
        activities<ActivityCountBucketRow[]>({ ...closedFilter, granularity }),
        fromTinybird(log, 'issues_average_resolve_velocity', () =>
          client.fetch<ResolveVelocityRow[]>(resolveVelocityPath, filter),
        ),
      ]);

      return {
        summary: {
          ...toPeriodSummary(
            currentSummary.data[0]?.activityCount ?? 0,
            previousSummary.data[0]?.activityCount ?? 0,
            current,
          ),
          avgResolveTimeSeconds: velocity.data[0]?.averageIssueResolveVelocitySeconds ?? null,
        },
        data: mergeBuckets(opened.data, closed.data),
      };
    },
  );
};

export default issuesResolutionRoutes;
