// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  resolvePeriods,
  hasBucketBounds,
  toIsoUtc,
  toNullablePeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import { nullablePeriodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

interface SummaryRow {
  patchsetsPerReview?: number | null;
}

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

const PatchsetsPerReviewSummary = nullablePeriodSummary({
  measure: 'Patchsets per Gerrit changeset opened',
  unit: 'patchsets per review',
  title: 'PatchsetsPerReviewSummary',
  description:
    'Median or average patchsets per Gerrit changeset, as `stat` selects and rounded to two decimals, for the current period against the comparison period before it.',
  nullWhen: {
    current: 'Null when no Gerrit changeset with a patchset count was opened in the period.',
    previous: 'Null when no Gerrit changeset with a patchset count was opened in that period.',
  },
});

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
      const dates = resolvePeriods(startDate, endDate);

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

      const [currentRows, previousRows, seriesRows] = rows ?? [[], [], []];
      return {
        summary: toNullablePeriodSummary(
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
