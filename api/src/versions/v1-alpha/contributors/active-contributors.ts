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
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import {
  BucketBounds,
  ContributionFlags,
  periodSummary,
  ProjectSlugParams,
  SeriesQuery,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/active_contributors.json';

interface SummaryRow {
  contributorCount?: number;
  maintainerCount?: number;
  reviewerCount?: number;
}

interface SeriesRow {
  startDate: string | null;
  endDate: string | null;
  contributorCount?: number;
}

const ActiveContributorsQuery = Type.Object({
  ...SeriesQuery.properties,
  ...ContributionFlags.properties,
});

const ActiveContributorsBucket = Type.Object({
  ...BucketBounds.properties,
  contributors: Type.Integer({
    description:
      'Active contributors in the bucket (count). A person active in several buckets counts in each, so the buckets can add up to more than `summary.current`.',
  }),
});

const ActiveContributorsSummary = periodSummary({
  measure: 'Active contributors',
  unit: 'count',
  kind: 'integer',
  title: 'ActiveContributorsSummary',
  description: 'Active contributors in the current period against the comparison period.',
});

const ActiveContributors = Type.Object({
  summary: ActiveContributorsSummary,
  maintainerCount: Type.Integer({
    description:
      'People listed in a maintainer file of a project repository, such as MAINTAINERS, CODEOWNERS or CONTRIBUTORS, at some point in the current period, whatever role the file gives them, contributor included (count). It counts from the maintainer files alone, so activity and the contribution flags leave it unchanged.',
  }),
  reviewerCount: Type.Integer({
    description:
      'People who reviewed a GitHub pull request, approved or requested changes on a GitLab merge request, or approved a Gerrit patchset in the current period (count). These reviews are code contributions, so the count is 0 when `includeCodeContributions` is false.',
  }),
  data: Type.Array(ActiveContributorsBucket, {
    description:
      'One entry per granularity bucket in the current period, ascending by `startDate`. The first and last buckets keep their full calendar bounds but count only activity inside the period. A bucket the pipe reports without both bounds is omitted.',
  }),
});

const activeContributorsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/active-contributors',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get active contributors',
        description:
          'Returns the number of active contributors in the period against the comparison period before it, the maintainer and reviewer counts in the period, and the active contributors per bucket. An active contributor is a person with at least one activity in the period of a kind the contribution flags select: code contributions unless `includeCodeContributions` is false, and collaborations when `includeCollaborations` is true. `repos` narrows every count to those repositories. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: ActiveContributorsQuery,
        response: { 200: ActiveContributors },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const {
        repos,
        startDate,
        endDate,
        granularity,
        includeCodeContributions = true,
        includeCollaborations = false,
      } = request.query;
      const dates = resolvePeriods(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          includeCodeContributions,
          includeCollaborations,
        };
        const currentRange = toTinybirdRange(dates.current);

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, { ...shared, ...currentRange }),
          fetchPipe<SummaryRow>(request, pipePath, {
            ...shared,
            ...toTinybirdRange(dates.previous),
          }),
          fetchPipe<SeriesRow>(request, pipePath, { ...shared, ...currentRange, granularity }),
        ]);
      });
      if (!rows) {
        return {
          summary: toPeriodSummary(0, 0, dates.current),
          maintainerCount: 0,
          reviewerCount: 0,
          data: [],
        };
      }

      const [currentRows, previousRows, seriesRows] = rows;
      const current = currentRows[0];
      const previous = previousRows[0];
      return {
        summary: toPeriodSummary(
          current?.contributorCount ?? 0,
          previous?.contributorCount ?? 0,
          dates.current,
        ),
        maintainerCount: current?.maintainerCount ?? 0,
        reviewerCount: current?.reviewerCount ?? 0,
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          contributors: row.contributorCount ?? 0,
        })),
      };
    },
  );
};

export default activeContributorsRoutes;
