// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { Type } from '@sinclair/typebox';
import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toNullablePeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import {
  nullablePeriodSummary,
  Platform,
  ProjectSlugParams,
  SeriesQuery,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/median_time_to_close.json';

interface SummaryRow {
  medianTimeToCloseSeconds?: number | null;
}

// With granularity the pipe fills empty buckets with 0, and generate_timeseries types both bucket
// bounds Nullable(Date).
interface SeriesRow extends SummaryRow {
  startDate: string | null;
  endDate: string | null;
}

const MedianTimeToCloseQuery = Type.Object({
  ...SeriesQuery.properties,
  platform: Type.Optional(Platform),
});

const MedianTimeToCloseSummary = nullablePeriodSummary({
  measure: 'Median time from a pull request being opened to being closed',
  unit: 'seconds',
  title: 'MedianTimeToCloseSummary',
  description:
    'Median time to close a pull request, in seconds, for the current period and the period immediately before it.',
  nullWhen: {
    current: 'Null when no pull request opened in the period has been closed.',
    previous: 'Null when no pull request opened in that period has been closed.',
  },
});

const MedianTimeToCloseBucket = Type.Object({
  startDate: Type.String({
    format: 'date-time',
    description: 'First day of the bucket, at 00:00:00 UTC.',
  }),
  endDate: Type.String({
    format: 'date-time',
    description: 'Last calendar day of the bucket, at 00:00:00 UTC.',
  }),
  medianTimeToCloseSeconds: Type.Number({
    description:
      'Median time from being opened to being closed, over the pull requests opened in the bucket (seconds). 0 when no pull request opened in the bucket has been closed, since only positive close times count.',
  }),
});

const MedianTimeToClose = Type.Object({
  summary: MedianTimeToCloseSummary,
  data: Type.Array(MedianTimeToCloseBucket, {
    description:
      'One entry per granularity bucket in the current period, in the order the pipe returns them. A bucket the pipe reports without both bounds is omitted.',
  }),
});

// The pipe types the median Nullable(Float64); anything else would reach the serializer as a 500,
// where fetchPipe turns a row outside the contract into a 503.
const isNullableNumber = (value: unknown) =>
  value === null || value === undefined || typeof value === 'number';
const isSummaryRow = (row: SummaryRow) => isNullableNumber(row.medianTimeToCloseSeconds);

const medianTimeToCloseRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  // median_time_to_close compares openedAt <= endDate where the sibling pull request pipes use <,
  // so the boundary sentence in the description differs from theirs on purpose.
  scope.get(
    '/projects/:slug/development/median-time-to-close',
    {
      schema: {
        tags: ['Development'],
        summary: 'Median time to close',
        description:
          'Returns the median time a pull request takes from being opened to being closed, in seconds, for the current period against the comparison period before it (`summary`), and the same median per bucket of the requested granularity (`data`). The period and the buckets select pull requests by the day they were opened, from 00:00 UTC on `startDate` up to 00:00 UTC on `endDate`, so activity later on `endDate` is outside the period; the pipe compares with `<=`, so a pull request opened at exactly 00:00 UTC on `endDate` is still counted. The median is over how long those took to close. Without dates the period runs from 2010-01-01 to today. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. ' +
          'Only pull requests already closed, whether merged or closed without merging, with a positive close time count. `platform` narrows the median to GitHub pull requests, GitLab merge requests or Gerrit changesets; when omitted, the median covers GitHub, GitLab and Gerrit together. A period with no closed pull request has a null median, and `changeValue` and `percentageChange` are null whenever `current` or `previous` is null; a bucket with no closed pull request carries 0. ' +
          'An unknown project returns a null summary with the requested period bounds and an empty `data` list after the project lookup alone; a known project makes three concurrent pipe calls, plus one project lookup when the process has no cached bucket for the slug.',
        params: ProjectSlugParams,
        querystring: MedianTimeToCloseQuery,
        response: { 200: MedianTimeToClose },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity, platform } = request.query;
      // A bad range is a 400, so it is checked before the 503 mapping can catch it.
      const dates = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        // The client drops an undefined platform from the query string, so the pipe then applies
        // no platform filter.
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          platform,
        };
        const currentRange = toTinybirdRange(dates.current);

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, { ...shared, ...currentRange }, isSummaryRow),
          fetchPipe<SummaryRow>(
            request,
            pipePath,
            { ...shared, ...toTinybirdRange(dates.previous) },
            isSummaryRow,
          ),
          fetchPipe<SeriesRow>(
            request,
            pipePath,
            { ...shared, ...currentRange, granularity },
            isSummaryRow,
          ),
        ]);
      });
      if (!rows) {
        return { summary: toNullablePeriodSummary(null, null, dates.current), data: [] };
      }

      const [currentRows, previousRows, seriesRows] = rows;
      return {
        summary: toNullablePeriodSummary(
          currentRows[0]?.medianTimeToCloseSeconds ?? null,
          previousRows[0]?.medianTimeToCloseSeconds ?? null,
          dates.current,
        ),
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          medianTimeToCloseSeconds: row.medianTimeToCloseSeconds ?? 0,
        })),
      };
    },
  );
};

export default medianTimeToCloseRoutes;
