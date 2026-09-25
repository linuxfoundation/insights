// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { ActivityTypes } from '@lfx-insights/types';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  resolvePeriods,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import { periodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/activities_count.json';

const codeReviewTypes = [
  ActivityTypes.PULL_REQUEST_REVIEWED,
  ActivityTypes.MERGE_REQUEST_REVIEW_CHANGES_REQUESTED,
  ActivityTypes.MERGE_REQUEST_REVIEW_APPROVED,
  ActivityTypes.CHANGESET_COMMENT_CREATED,
  ActivityTypes.PATCHSET_COMMENT_CREATED,
];

interface SummaryRow {
  activityCount?: number;
}

interface SeriesRow extends SummaryRow {
  startDate: string | null;
  endDate: string | null;
}

const CodeReviewsSummary = periodSummary({
  measure: 'Code reviews',
  unit: 'count',
  kind: 'integer',
  title: 'CodeReviewsSummary',
  description: 'Code reviews in the current period against the previous one.',
});

const CodeReviewsBucket = Type.Object({
  startDate: Type.String({
    format: 'date-time',
    description: 'First day of the bucket, at 00:00:00 UTC.',
  }),
  endDate: Type.String({
    format: 'date-time',
    description: 'Last calendar day of the bucket, at 00:00:00 UTC.',
  }),
  reviews: Type.Integer({ description: 'Code reviews in the bucket (count).' }),
});

const CodeReviews = Type.Object({
  summary: CodeReviewsSummary,
  data: Type.Array(CodeReviewsBucket, {
    description:
      'One entry per granularity bucket in the current period, in pipe order. A bucket the pipe reports without both bounds is omitted.',
  }),
});

const codeReviewsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/code-reviews',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get code reviews',
        description:
          'Returns the code reviews in the period against the comparison period before it, and the code reviews in each bucket. A code review is one of these activities: a GitHub pull request review (`pull_request-reviewed`), a GitLab merge request approval or change request (`merge_request-review-approved`, `merge_request-review-changes-requested`), or a Gerrit changeset or patchset comment (`changeset_comment-created`, `patchset_comment-created`). The two Gerrit comment types also count as review comments, so this endpoint and `review-comments` overlap on them. `granularity` has no default and must be sent. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: SeriesQuery,
        response: { 200: CodeReviews },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity } = request.query;
      const { current, previous } = resolvePeriods(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          activity_types: codeReviewTypes,
        };
        const currentRange = toTinybirdRange(current);

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, { ...shared, ...currentRange }),
          fetchPipe<SummaryRow>(request, pipePath, { ...shared, ...toTinybirdRange(previous) }),
          fetchPipe<SeriesRow>(request, pipePath, { ...shared, ...currentRange, granularity }),
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
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          reviews: row.activityCount ?? 0,
        })),
      };
    },
  );
};

export default codeReviewsRoutes;
