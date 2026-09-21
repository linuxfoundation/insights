// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { ActivityPlatforms } from '@lfx-insights/types';
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

// One row of a Nullable median; a period without a reviewed pull request can also come back as
// no row at all.
interface SummaryRow {
  medianTimeToReviewSeconds?: number | null;
}

// The pipe types the bucket bounds Nullable(Date) and writes 0 for a bucket without a reviewed
// pull request.
interface SeriesRow extends SummaryRow {
  startDate: string | null;
  endDate: string | null;
}

const pipePath = '/v0/pipes/median_time_to_review.json';

// The pipe filters by platform only when the key is sent, so an omitted value covers all three.
const Platform =
  Type.Unsafe<`${ActivityPlatforms.GITHUB | ActivityPlatforms.GITLAB | ActivityPlatforms.GERRIT}`>({
    type: 'string',
    enum: [ActivityPlatforms.GITHUB, ActivityPlatforms.GITLAB, ActivityPlatforms.GERRIT],
    description:
      'Source platform to count pull requests from: `github` pull requests, `gitlab` merge requests or `gerrit` changesets, one of the values the project endpoint lists in `connectedPlatforms`. When omitted, pull requests from all three platforms are counted together.',
  });

const MedianTimeToReviewQuery = Type.Object({
  ...SeriesQuery.properties,
  platform: Type.Optional(Platform),
});

// The spec is OpenAPI 3.0.3, which has no type 'null'; see PeriodSummary.percentageChange.
const nullableNumber = (description: string) =>
  Type.Unsafe<number | null>({ type: 'number', nullable: true, description });

// PeriodSummary types its numbers as plain, but a median over no pull requests is null, so the
// three are overridden here and percentageChange gains the null-when-either-side-null rule.
const durationSummary = (measure: string, title: string) =>
  Type.Object(
    {
      ...PeriodSummary.properties,
      current: nullableNumber(
        `${measure} in the current period (seconds). Null when no pull request opened in the period was reviewed.`,
      ),
      previous: nullableNumber(
        `${measure} in the comparison period, which ends the day before \`periodFrom\`. Its span is derived in calendar months and days, so its elapsed days can differ from the current period (seconds). Null when no pull request opened in that period was reviewed.`,
      ),
      changeValue: nullableNumber(
        '`current` minus `previous` (seconds). Null when `current` or `previous` is null.',
      ),
      percentageChange: nullableNumber(
        'Signed percent change from `previous` to `current`. Null when `current` or `previous` is null, or when `previous` is 0 and `current` is not.',
      ),
    },
    {
      title,
      description: `${measure}, in seconds, for the current period and the period immediately before it.`,
    },
  );

const MedianTimeToReviewBucket = Type.Object({
  startDate: Type.String({
    format: 'date-time',
    description: 'First day of the bucket, at 00:00:00 UTC.',
  }),
  endDate: Type.String({
    format: 'date-time',
    description: 'Last calendar day of the bucket, at 00:00:00 UTC.',
  }),
  medianTimeToReviewSeconds: Type.Number({
    description:
      'Median time from a pull request being opened to its first review, over the pull requests opened in the bucket (seconds). 0 when none of them has been reviewed, as the pipe reports it.',
  }),
});

const MedianTimeToReview = Type.Object({
  summary: durationSummary(
    'Median time from a pull request being opened to its first review',
    'MedianTimeToReviewSummary',
  ),
  data: Type.Array(MedianTimeToReviewBucket, {
    description:
      'One entry per granularity bucket in the current period, in pipe order. A bucket the pipe reports without both bounds is omitted.',
  }),
});
type MedianTimeToReview = Static<typeof MedianTimeToReview>;
type DurationSummary = MedianTimeToReview['summary'];

// toPeriodSummary takes plain numbers; a side without data leaves nothing to compare against.
function toDurationSummary(
  current: number | null,
  previous: number | null,
  range: DateRange,
): DurationSummary {
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

const medianTimeToReviewRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/median-time-to-review',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get median time to review',
        description:
          'Returns the median time from a pull request being opened to its first review, in seconds, as a summary for the current period against the comparison period before it (`summary`) and per bucket of the requested granularity (`data`). The period selects pull requests by the day they were opened, and only pull requests that have been reviewed count. ' +
          '`platform` narrows the pull requests to one source platform; when omitted, GitHub pull requests, GitLab merge requests and Gerrit changesets are counted together. ' +
          'A period without a reviewed pull request has a null median, and `changeValue` and `percentageChange` are null whenever `current` or `previous` is null; a bucket without a reviewed pull request reports 0. `granularity` has no default and must be sent. ' +
          'The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. ' +
          'An unknown project returns a null summary and an empty `data` list after the project lookup alone; a known project makes three concurrent pipe calls, plus one project lookup when the process has no cached bucket for the slug.',
        params: ProjectSlugParams,
        querystring: MedianTimeToReviewQuery,
        response: { 200: MedianTimeToReview },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity, platform } = request.query;
      // A bad range is a 400, so it is checked before the 503 mapping can catch it.
      const dates = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const filter: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          platform,
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
      // An unknown project reads as three empty results, the same body a project without a
      // reviewed pull request in either period gets.
      const [currentRows, previousRows, seriesRows] = rows ?? [[], [], []];
      return {
        summary: toDurationSummary(
          currentRows[0]?.medianTimeToReviewSeconds ?? null,
          previousRows[0]?.medianTimeToReviewSeconds ?? null,
          dates.current,
        ),
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          medianTimeToReviewSeconds: row.medianTimeToReviewSeconds ?? 0,
        })),
      };
    },
  );
};

export default medianTimeToReviewRoutes;
