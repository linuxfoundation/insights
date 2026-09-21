// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { Type, type Static } from '@sinclair/typebox';
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
import { PeriodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

// One row of a rounded median or average over a Nullable column; a period without Gerrit
// changesets can also come back as no row at all.
interface SummaryRow {
  patchsetsPerReview?: number | null;
}

// The pipe declares both bucket bounds as Nullable(Date).
interface SeriesRow {
  startDate: string | null;
  endDate: string | null;
  patchsetsPerReview?: number;
}

const pipePath = '/v0/pipes/patchsets_per_review.json';

const PatchsetsPerReviewQuery = Type.Object({
  ...SeriesQuery.properties,
  stat: Type.Optional(
    Type.Unsafe<'median' | 'average'>({
      type: 'string',
      enum: ['median', 'average'],
      default: 'median',
      description:
        'Statistic the pipe computes over the patchset counts of the Gerrit changesets in each period and bucket, and so what `summary` and every `value` hold: `median` (the default, as in the Insights widget) or `average`.',
    }),
  ),
});

// The spec is OpenAPI 3.0.3, which has no type 'null'; see PeriodSummary.percentageChange.
const nullableNumber = (description: string) =>
  Type.Unsafe<number | null>({ type: 'number', nullable: true, description });

// PeriodSummary types its numbers as plain, but a median over no changesets is null, so the three
// are overridden here and percentageChange gains the null-when-either-side-null rule.
const PatchsetsPerReviewSummary = Type.Object(
  {
    ...PeriodSummary.properties,
    current: nullableNumber(
      'Median or average number of patchsets per Gerrit changeset opened in the current period, as `stat` selects, rounded to two decimals (patchsets per review). Null when no Gerrit changeset with a patchset count was opened in the period.',
    ),
    previous: nullableNumber(
      'Median or average number of patchsets per Gerrit changeset opened in the comparison period, which ends the day before `periodFrom`. Its span is derived in calendar months and days, so its elapsed days can differ from the current period (patchsets per review). Null when no Gerrit changeset with a patchset count was opened in that period.',
    ),
    changeValue: nullableNumber(
      '`current` minus `previous` (patchsets per review). Null when `current` or `previous` is null.',
    ),
    percentageChange: nullableNumber(
      'Signed percent change from `previous` to `current`. Null when `current` or `previous` is null, or when `previous` is 0 and `current` is not.',
    ),
  },
  {
    title: 'PatchsetsPerReviewSummary',
    description:
      'Patchsets per review for the current period against the comparison period before it, as the statistic `stat` selects.',
  },
);
type PatchsetsPerReviewSummary = Static<typeof PatchsetsPerReviewSummary>;

const PatchsetsPerReview = Type.Object({
  summary: PatchsetsPerReviewSummary,
  data: Type.Array(
    Type.Object({
      startDate: Type.String({
        format: 'date-time',
        description: 'First day of the bucket, at UTC midnight.',
      }),
      endDate: Type.String({
        format: 'date-time',
        description: 'Last day of the bucket, at UTC midnight.',
      }),
      value: Type.Number({
        description:
          'Median or average number of patchsets per Gerrit changeset opened in the bucket, as `stat` selects, rounded to two decimals (patchsets per review). 0 when no Gerrit changeset with a patchset count was opened in the bucket.',
      }),
    }),
    {
      description:
        'One entry per bucket of the requested granularity, ascending by `startDate`; a bucket without changesets is present with `value` 0, and a bucket the pipe reports without both bounds is omitted.',
    },
  ),
});

// toPeriodSummary takes plain numbers; a side without data leaves nothing to compare against.
function toNullableSummary(
  current: number | null,
  previous: number | null,
  range: DateRange,
): PatchsetsPerReviewSummary {
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

const patchsetsPerReviewRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/patchsets-per-review',
    {
      schema: {
        tags: ['Development'],
        summary: 'Patchsets per review',
        description:
          'Returns the number of patchsets a Gerrit changeset needed during review, as the median or the average per `stat`: a `summary` comparing the current period with the comparison period before it, and one `value` per time bucket of the requested granularity in `data`. Patchsets are a Gerrit concept, so the data covers Gerrit changesets only, each counted by the day it was opened and only when it carries a patchset count. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. Without dates the period runs from 2010-01-01 to today. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. ' +
          'A period without such a changeset has a null summary value, and `changeValue` and `percentageChange` are null whenever `current` or `previous` is null; a bucket without one has `value` 0. ' +
          'An unknown project returns a null summary with the requested period bounds and an empty `data` list after the project lookup alone; a known project makes three concurrent pipe calls, plus one project lookup when the process has no cached bucket for the slug.',
        params: ProjectSlugParams,
        querystring: PatchsetsPerReviewQuery,
        response: { 200: PatchsetsPerReview },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity, stat = 'median' } = request.query;
      // A bad range is a 400, so it is checked before the 503 mapping can catch it.
      const dates = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const filter: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          dataType: stat,
        };
        const currentRange = toTinybirdRange(dates.current);

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, { ...filter, ...currentRange }),
          fetchPipe<SummaryRow>(request, pipePath, {
            ...filter,
            ...toTinybirdRange(dates.previous),
          }),
          fetchPipe<SeriesRow>(request, pipePath, { ...filter, ...currentRange, granularity }),
        ]);
      });

      // An unknown project reads as three empty results, the same body a project without Gerrit
      // changesets in either period gets.
      const [currentRows, previousRows, seriesRows] = rows ?? [[], [], []];
      return {
        summary: toNullableSummary(
          currentRows[0]?.patchsetsPerReview ?? null,
          previousRows[0]?.patchsetsPerReview ?? null,
          dates.current,
        ),
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          value: row.patchsetsPerReview ?? 0,
        })),
      };
    },
  );
};

export default patchsetsPerReviewRoutes;
