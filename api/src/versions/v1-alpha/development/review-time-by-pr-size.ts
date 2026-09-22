// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { getPreviousDates, toTinybirdRange } from '../../../lib/period.js';
import { DateRangeQuery, nullableNumber, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/pull_requests_review_time_by_size.json';

// The pipe declares reviewedInSecondsAvg Nullable(Float64).
interface ReviewTimeRow {
  gitChangedLinesBucket: string;
  reviewedInSecondsAvg: number | null;
  pullRequestCount: number;
}

// Rows the guard rejects become the documented 503 in fetchPipe, see clients/tinybird.ts.
const isReviewTimeRow = (row: ReviewTimeRow) =>
  typeof row.gitChangedLinesBucket === 'string' &&
  Number.isSafeInteger(row.pullRequestCount) &&
  row.pullRequestCount >= 0 &&
  (row.reviewedInSecondsAvg === null || typeof row.reviewedInSecondsAvg === 'number');

const ReviewTimeBucket = Type.Object({
  lines: Type.String({
    description:
      'Size bucket of the pull request, as lines changed: `1-9`, `10-59`, `60-99`, `100-499` or `500+`.',
  }),
  prCount: Type.Integer({
    description:
      'Number of pull requests in the bucket whose first review happened in the period (count).',
  }),
  averageReviewTimeSeconds: nullableNumber(
    "Average time from opening a pull request in the bucket to its first review, in seconds. Null when none of the bucket's pull requests has a recorded review time.",
  ),
});

const ReviewTimeByPrSize = Type.Object({
  data: Type.Array(ReviewTimeBucket, {
    description:
      'One entry per size bucket with at least one pull request first reviewed in the period, in ascending size order as the pipe returns them. An unknown project gets an empty list.',
  }),
});

const reviewTimeByPrSizeRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/review-time-by-pr-size',
    {
      schema: {
        tags: ['Development'],
        summary: 'Review time by pull request size',
        description:
          'Returns, for each pull request size bucket, the number of pull requests whose first review happened in the period and their average review time in seconds. ' +
          'Review time runs from the pull request being opened to its first review by someone other than the author. ' +
          'Size is the number of lines changed in the pull request, in the buckets `1-9`, `10-59`, `60-99`, `100-499` and `500+`; a pull request with no recorded line count is left out. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`, applied to the first review timestamp; without dates it runs from 2010-01-01 to today. ' +
          'Buckets come back in ascending size order, as the underlying pipe orders them, and a bucket with no pull request reviewed in the period is left out. ' +
          'Covers GitHub and GitLab pull requests; Gerrit changesets are excluded. An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: DateRangeQuery,
        response: { 200: ReviewTimeByPrSize },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate } = request.query;
      // This metric has no comparison period; the call still fills the default range and
      // rejects an inverted one with a 400 before any Tinybird request.
      const { current } = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<ReviewTimeRow>(
          request,
          pipePath,
          {
            project: slug,
            bucketId,
            repos: repoFilter(repos),
            ...toTinybirdRange(current),
          },
          isReviewTimeRow,
        ),
      );
      return {
        data: (rows ?? []).map((row) => ({
          lines: row.gitChangedLinesBucket,
          prCount: row.pullRequestCount,
          averageReviewTimeSeconds: row.reviewedInSecondsAvg,
        })),
      };
    },
  );
};

export default reviewTimeByPrSizeRoutes;
