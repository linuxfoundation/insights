// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { ActivityTypes } from '@lfx-insights/types';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import { periodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/activities_count.json';

// The Nuxt reviewCommentsActivityTypes list in its order, so both send the pipe the same value.
const reviewCommentTypes = [
  ActivityTypes.PULL_REQUEST_COMMENT,
  ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
  ActivityTypes.MERGE_REQUEST_COMMENT,
  ActivityTypes.CHANGESET_COMMENT_CREATED,
  ActivityTypes.PATCHSET_COMMENT_CREATED,
];

interface SummaryRow {
  activityCount?: number;
}

interface SeriesRow extends SummaryRow {
  startDate: string;
  endDate: string;
}

const ReviewCommentsBucket = Type.Object({
  startDate: Type.String({ format: 'date-time', description: 'Start of the bucket (UTC).' }),
  endDate: Type.String({ format: 'date-time', description: 'End of the bucket (UTC).' }),
  reviewComments: Type.Integer({ description: 'Review comments made in the bucket (count).' }),
});

const ReviewComments = Type.Object({
  summary: periodSummary({
    measure: 'Review comments',
    unit: 'count',
    kind: 'integer',
    title: 'ReviewCommentsSummary',
    description: 'Review comments in the current period against the previous one.',
  }),
  data: Type.Array(ReviewCommentsBucket, {
    description: 'One entry per granularity bucket in the current period.',
  }),
});

const reviewCommentsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/review-comments',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get review comments',
        description:
          'Returns the review comments made in the period against the comparison period before it, and the review comments in each bucket. A review comment is an activity of type `pull_request-comment`, `pull_request-review-thread-comment`, `merge_request-comment`, `changeset_comment-created` or `patchset_comment-created`; the last two are also counted by the `code-reviews` endpoint, so the two overlap on Gerrit comments. `granularity` is required: a request without it is rejected with 400, unlike the Insights UI, which defaults it to quarterly. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: SeriesQuery,
        response: { 200: ReviewComments },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity } = request.query;
      // A bad range is a 400, so it is checked before the 503 mapping can catch it.
      const { current, previous } = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const filter: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          activity_types: reviewCommentTypes,
          ...toTinybirdRange(current),
        };

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, filter),
          fetchPipe<SummaryRow>(request, pipePath, { ...filter, ...toTinybirdRange(previous) }),
          fetchPipe<SeriesRow>(request, pipePath, { ...filter, granularity }, hasBucketBounds),
        ]);
      });
      if (!rows) {
        return { summary: toPeriodSummary(0, 0, current), data: [] };
      }

      const [currentRows, previousRows, seriesRows] = rows;
      return {
        summary: toPeriodSummary(
          currentRows[0]?.activityCount ?? 0,
          previousRows[0]?.activityCount ?? 0,
          current,
        ),
        data: seriesRows.map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          reviewComments: row.activityCount ?? 0,
        })),
      };
    },
  );
};

export default reviewCommentsRoutes;
