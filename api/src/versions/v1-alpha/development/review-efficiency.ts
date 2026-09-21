// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';
import { ActivityPlatforms } from '@lfx-insights/types';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
  utcMidnight,
  type DateRange,
} from '../../../lib/period.js';
import {
  PeriodSummary,
  periodSummary,
  ProjectSlugParams,
  SeriesQuery,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/review_efficiency.json';

// The Nuxt data layer reads openedCount and resolvedCount; its stale series type says mergedCount,
// which the mapping never uses.
interface SummaryRow {
  openedCount?: number;
  resolvedCount?: number;
}

interface SeriesRow extends SummaryRow {
  startDate: string | null;
  endDate: string | null;
}

// fetchPipe's default validator accepts a null element. Without this guard a null series row makes
// hasBucketBounds throw outside the 503 mapping, and a null summary row reads as zero counts.
const isRow = (row: SummaryRow) => typeof row === 'object' && row !== null;

// Type.Unsafe shows up in OpenAPI as a plain enum, for the same reason Granularity in common.ts
// uses it.
const Platform =
  Type.Unsafe<`${ActivityPlatforms.GITHUB | ActivityPlatforms.GITLAB | ActivityPlatforms.GERRIT}`>({
    type: 'string',
    enum: [ActivityPlatforms.GITHUB, ActivityPlatforms.GITLAB, ActivityPlatforms.GERRIT],
    description:
      'Platform to count pull requests from: `github`, `gitlab` or `gerrit`. Without it the counts cover every platform the project has data for, as the Insights widget does. `connectedPlatforms` on the project endpoint can list other platforms, such as `git`; those get a 400 here.',
  });

const Query = Type.Object({
  ...SeriesQuery.properties,
  platform: Type.Optional(Platform),
});

// The spec is OpenAPI 3.0.3, which has no type 'null'; see PeriodSummary.percentageChange.
const nullableNumber = (description: string) =>
  Type.Unsafe<number | null>({ type: 'number', nullable: true, description });

// PeriodSummary types its numbers as plain, but a period without opened pull requests has no
// denominator, so the three are overridden here and percentageChange gains the rule that either
// side being null nulls it.
const ReviewEfficiencySummary = Type.Object(
  {
    ...PeriodSummary.properties,
    current: nullableNumber(
      'Closed pull requests as a percentage of opened ones in the current period (percent). Null when no pull request was opened in the period.',
    ),
    previous: nullableNumber(
      'Closed pull requests as a percentage of opened ones in the comparison period, which ends the day before `periodFrom`. Its span is derived in calendar months and days, so its elapsed days can differ from the current period (percent). Null when no pull request was opened in that period.',
    ),
    changeValue: nullableNumber(
      '`current` minus `previous` (percentage points). Null when `current` or `previous` is null.',
    ),
    percentageChange: nullableNumber(
      'Signed percent change from `previous` to `current`. Null when `current` or `previous` is null, or when `previous` is 0 and `current` is not.',
    ),
  },
  {
    title: 'ReviewEfficiencySummary',
    description:
      'Closed pull requests as a percentage of opened ones, for the current period and the period immediately before it. The Insights widget shows this value as a ratio; the API reshapes it to a percent, so the change is in percentage points, and it exceeds 100 when more pull requests were closed than opened.',
  },
);
type ReviewEfficiencySummary = Static<typeof ReviewEfficiencySummary>;

const ReviewEfficiencyBucket = Type.Object({
  startDate: Type.String({
    format: 'date-time',
    description: 'First day of the bucket, at 00:00:00 UTC.',
  }),
  endDate: Type.String({
    format: 'date-time',
    description: 'Last calendar day of the bucket, at 00:00:00 UTC.',
  }),
  opened: Type.Integer({ description: 'Pull requests opened in the bucket (count).' }),
  closed: Type.Integer({ description: 'Pull requests closed in the bucket (count).' }),
});

const ReviewEfficiency = Type.Object({
  efficiencyPercentage: ReviewEfficiencySummary,
  openedSummary: periodSummary({
    measure: 'Pull requests opened',
    unit: 'count',
    kind: 'integer',
    title: 'ReviewEfficiencyOpenedSummary',
    description:
      'Pull requests opened in the current period against the comparison period before it.',
  }),
  closedSummary: periodSummary({
    measure: 'Pull requests closed',
    unit: 'count',
    kind: 'integer',
    title: 'ReviewEfficiencyClosedSummary',
    description:
      'Pull requests closed in the current period against the comparison period before it. The pipe reports this count as resolved; the Insights widget labels it closed.',
  }),
  data: Type.Array(ReviewEfficiencyBucket, {
    description:
      'One entry per granularity bucket in the current period, in pipe order. A bucket the pipe reports without both bounds is omitted.',
  }),
});

interface Counts {
  opened: number;
  closed: number;
}

const counts = (rows: SummaryRow[]): Counts => ({
  opened: rows[0]?.openedCount ?? 0,
  closed: rows[0]?.resolvedCount ?? 0,
});
// Null when nothing was opened, so there is no denominator; above 100 when more closed than opened.
const efficiency = ({ opened, closed }: Counts) => (opened > 0 ? (closed / opened) * 100 : null);

// toPeriodSummary takes plain numbers; a side without data leaves nothing to compare against.
function toEfficiencySummary(
  current: number | null,
  previous: number | null,
  range: DateRange,
): ReviewEfficiencySummary {
  if (current === null || previous === null) {
    return {
      current,
      previous,
      percentageChange: null,
      changeValue: null,
      periodFrom: utcMidnight(range.startDate),
      periodTo: utcMidnight(range.endDate),
    };
  }
  return toPeriodSummary(current, previous, range);
}

const reviewEfficiencyRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/review-efficiency',
    {
      schema: {
        tags: ['Development'],
        summary: 'Review efficiency',
        description:
          'Returns closed pull requests as a percentage of opened pull requests (`efficiencyPercentage`) for the period against the comparison period before it, the opened and closed counts as their own summaries, and the pull requests opened and closed in each bucket. The Insights widget shows the efficiency as a ratio; the API reshapes it to a percent, so its `changeValue` is in percentage points, and it exceeds 100 when more pull requests were closed than opened. The efficiency is null for a period in which no pull request was opened, and its `changeValue` and `percentageChange` are null whenever `current` or `previous` is null. ' +
          'Pull requests here cover GitHub pull requests, GitLab merge requests and Gerrit changesets. `platform` narrows the counts to one of them; `connectedPlatforms` on the project endpoint can list further platforms, such as `git`, and those get a 400 here. Without it the pipe is called with no platform filter and covers every platform the project has data for, as the Insights widget does. `granularity` has no default and must be sent. ' +
          'The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. ' +
          'An unknown project returns a null efficiency, zero counts and an empty `data` list after the project lookup alone; a known project makes three concurrent pipe calls, plus one project lookup when the process has no cached bucket for the slug.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: ReviewEfficiency },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity, platform } = request.query;
      // A bad range is a 400, so it is checked before the 503 mapping can catch it.
      const { current, previous } = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        // An undefined platform is dropped from the query string by the client.
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          platform,
        };
        const currentRange = toTinybirdRange(current);

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, { ...shared, ...currentRange }, isRow),
          fetchPipe<SummaryRow>(
            request,
            pipePath,
            { ...shared, ...toTinybirdRange(previous) },
            isRow,
          ),
          fetchPipe<SeriesRow>(
            request,
            pipePath,
            { ...shared, ...currentRange, granularity },
            isRow,
          ),
        ]);
      });

      // An unknown project reads as three empty results: null efficiency, zero counts and an
      // empty series through the one code path.
      const [currentRows, previousRows, seriesRows] = rows ?? [[], [], []];
      const currentCounts = counts(currentRows);
      const previousCounts = counts(previousRows);
      return {
        efficiencyPercentage: toEfficiencySummary(
          efficiency(currentCounts),
          efficiency(previousCounts),
          current,
        ),
        openedSummary: toPeriodSummary(currentCounts.opened, previousCounts.opened, current),
        closedSummary: toPeriodSummary(currentCounts.closed, previousCounts.closed, current),
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          opened: row.openedCount ?? 0,
          closed: row.resolvedCount ?? 0,
        })),
      };
    },
  );
};

export default reviewEfficiencyRoutes;
