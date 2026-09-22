// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  toNullablePeriodSummary,
  toTinybirdRange,
  type DateRange,
} from '../../../lib/period.js';
import {
  DateRangeQuery,
  nullablePeriodSummary,
  ProjectSlugParams,
} from '../../../schemas/common.js';

interface LeadTimeRow {
  openedToMergedSeconds?: number | null;
  openedToReviewAssignedSeconds?: number | null;
  reviewAssignedToFirstReviewSeconds?: number | null;
  firstReviewToApprovedSeconds?: number | null;
  approvedToMergedSeconds?: number | null;
}

const pipePath = '/v0/pipes/pull_requests_merge_lead_time.json';

const durationSummary = (measure: string, title: string) =>
  nullablePeriodSummary({
    measure,
    unit: 'seconds',
    title,
    description: `${measure}, in seconds, for the current period and the period immediately before it.`,
    nullWhen: {
      current: 'Null when no pull request opened in the period reached this stage.',
      previous: 'Null when no pull request opened in that period reached this stage.',
    },
  });

const MergeLeadTime = Type.Object({
  summary: durationSummary(
    'Average time from a pull request being opened to being merged',
    'MergeLeadTimeSummary',
  ),
  pickupSeconds: durationSummary(
    'Average pickup time, from a pull request being opened to a review being requested',
    'MergeLeadTimePickup',
  ),
  reviewSeconds: durationSummary(
    'Average review time, from a review being requested to the first review',
    'MergeLeadTimeReview',
  ),
  acceptedSeconds: durationSummary(
    'Average acceptance time, from the first review to approval',
    'MergeLeadTimeAccepted',
  ),
  mergedSeconds: durationSummary(
    'Average merge time, from approval to the pull request being merged',
    'MergeLeadTimeMerged',
  ),
});

const mergeLeadTimeRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/merge-lead-time',
    {
      schema: {
        tags: ['Development'],
        summary: 'Merge lead time',
        description:
          'Returns the average time a pull request takes from being opened to being merged (`summary`) and how that time splits across four stages, each for the current period against the comparison period before it: `pickupSeconds` from opened to a review being requested, `reviewSeconds` from the review request to the first review, `acceptedSeconds` from the first review to approval, and `mergedSeconds` from approval to merge. Every value is an average in seconds. ' +
          'The period selects pull requests by the day they were opened: from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. Without dates the period runs from 2010-01-01 to today. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. ' +
          'GitHub and GitLab pull requests are counted; Gerrit changesets are excluded. Each average covers only the pull requests that reached both ends of that stage, so a stage no pull request reached is null, and `changeValue` and `percentageChange` are null whenever `current` or `previous` is null. ' +
          'An unknown project returns every value null with the requested period bounds after the project lookup alone; a known project makes two concurrent pipe calls, plus one project lookup when the process has no cached bucket for the slug.',
        params: ProjectSlugParams,
        querystring: DateRangeQuery,
        response: { 200: MergeLeadTime },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate } = request.query;
      const dates = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const filter: TinybirdQuery = { project: slug, bucketId, repos: repoFilter(repos) };
        const fetchLeadTime = (range: DateRange) =>
          fetchPipe<LeadTimeRow>(request, pipePath, { ...filter, ...toTinybirdRange(range) });
        return Promise.all([fetchLeadTime(dates.current), fetchLeadTime(dates.previous)]);
      });

      const [currentRows, previousRows] = rows ?? [[], []];
      const stage = (field: keyof LeadTimeRow) =>
        toNullablePeriodSummary(
          currentRows[0]?.[field] ?? null,
          previousRows[0]?.[field] ?? null,
          dates.current,
        );

      return {
        summary: stage('openedToMergedSeconds'),
        pickupSeconds: stage('openedToReviewAssignedSeconds'),
        reviewSeconds: stage('reviewAssignedToFirstReviewSeconds'),
        acceptedSeconds: stage('firstReviewToApprovedSeconds'),
        mergedSeconds: stage('approvedToMergedSeconds'),
      };
    },
  );
};

export default mergeLeadTimeRoutes;
