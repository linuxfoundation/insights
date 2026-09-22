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

// The pipe answers openedCount and resolvedCount; its DESCRIPTION block and the Nuxt series type
// still say mergedCount.
interface SummaryRow {
  openedCount?: number;
  resolvedCount?: number;
}

interface SeriesRow extends SummaryRow {
  startDate: string | null;
  endDate: string | null;
}

// fetchPipe's default validator accepts any element. A null row makes hasBucketBounds throw outside
// the 503 mapping; an array row or a count outside the nonnegative safe integers reads as bad data.
const isCount = (value?: number) =>
  value === undefined || (Number.isSafeInteger(value) && value >= 0);
const isRow = (row: SummaryRow) =>
  typeof row === 'object' &&
  row !== null &&
  !Array.isArray(row) &&
  isCount(row.openedCount) &&
  isCount(row.resolvedCount);

// Type.Unsafe shows up in OpenAPI as a plain enum, for the same reason Granularity in common.ts
// uses it.
const Platform =
  Type.Unsafe<`${ActivityPlatforms.GITHUB | ActivityPlatforms.GITLAB | ActivityPlatforms.GERRIT}`>({
    type: 'string',
    enum: [ActivityPlatforms.GITHUB, ActivityPlatforms.GITLAB, ActivityPlatforms.GERRIT],
    description:
      'Platform to count pull requests from: `github`, `gitlab` or `gerrit`. Without it the pipe applies no platform filter and counts every platform the project has pull request data for. `connectedPlatforms` on the project endpoint can list other platforms, such as `git`; those get a 400 here.',
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
      'Pull requests opened in the current period and since closed, as a percentage of all opened in it (percent). Null when no pull request was opened in the period.',
    ),
    previous: nullableNumber(
      'Pull requests opened in the comparison period and since closed, as a percentage of all opened in it. The comparison period ends the day before `periodFrom`; its span is derived in calendar months and days, so its elapsed days can differ from the current period (percent). Null when no pull request was opened in that period.',
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
      'Pull requests opened in a period and since closed, as a percentage of all opened in it, for the current period and the period immediately before it. The Insights widget shows this value as a ratio; the API reshapes it to a percent, so the change is in percentage points. Because `closed` counts a subset of `opened`, the value runs from 0 to 100.',
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
  closed: Type.Integer({
    description: 'Pull requests opened in the bucket that have since been closed (count).',
  }),
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
    measure: 'Pull requests that have since been closed, of those opened',
    unit: 'count',
    kind: 'integer',
    title: 'ReviewEfficiencyClosedSummary',
    description:
      'Pull requests opened in the current period that have since been closed, against the comparison period before it. The pipe counts a pull request as closed once it has a resolution time, merged or closed; the Insights widget labels this closed.',
  }),
  data: Type.Array(ReviewEfficiencyBucket, {
    description:
      'One entry per granularity bucket in the current period, ascending by `startDate`, with 0 counts for a bucket without pull requests. A bucket the pipe reports without both bounds is omitted.',
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
// Null when nothing was opened, so there is no denominator. Left unclamped: the pipe counts closed
// as a subset of opened, so a value above 100 would mean bad upstream data, not a real rate.
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
          'Returns the pull requests opened in the period that have since been closed, as a percentage of all pull requests opened in the period (`efficiencyPercentage`), against the comparison period before it; the opened and closed counts as their own summaries; and both counts per bucket. Closed means the pull request has a resolution time in the pipe, merged or closed, at any time up to now, so an older period has had longer to close its pull requests. The Insights widget shows the efficiency as a ratio; the API reshapes it to a percent, so its `changeValue` is in percentage points, and because `closed` counts a subset of `opened` it runs from 0 to 100. The efficiency is null for a period in which no pull request was opened, and its `changeValue` and `percentageChange` are null whenever `current` or `previous` is null. ' +
          'Pull requests cover GitHub pull requests, GitLab merge requests and Gerrit changesets. `platform` narrows the counts to one of them; `connectedPlatforms` on the project endpoint can list further platforms, such as `git`, and those get a 400 here. Without `platform` the pipe applies no platform filter and counts pull requests from every platform the project has pull request data for. `granularity` has no default and must be sent. ' +
          'The period selects pull requests by the day they were opened: from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. Without dates the period runs from 2010-01-01 to today. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. ' +
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
