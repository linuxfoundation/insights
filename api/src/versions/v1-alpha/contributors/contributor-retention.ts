// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { getPreviousDates, toTinybirdRange } from '../../../lib/period.js';
import {
  isRetentionRow,
  RetentionQuery,
  retentionResponse,
  toRetentionBucket,
  type RetentionRow,
} from '../../../lib/retention.js';
import { ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/contributor_retention.json';

const ContributorRetention = retentionResponse('contributor');

const contributorRetentionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/contributor-retention',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get contributor retention',
        description:
          "Returns, per granularity bucket, the share of the previous bucket's contributors who were active again in this bucket. " +
          'Activity here includes forks and stars along with everything the contribution flags select, since the underlying widget always counts them. ' +
          'The comparison is bucket over bucket, not against the whole period. `repos` narrows it to those repositories. ' +
          'Without dates the period runs from 2010-01-01 to today, and it runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. ' +
          'An unknown project returns an empty `data` list. Contributor identity fields are provisional in /v1-alpha.',
        params: ProjectSlugParams,
        querystring: RetentionQuery,
        response: { 200: ContributorRetention },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const {
        repos,
        startDate,
        endDate,
        granularity,
        activityType,
        includeCodeContributions = true,
        includeCollaborations = false,
      } = request.query;
      // Only the current range is used; getPreviousDates fills its defaults and checks its dates.
      const { current } = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<RetentionRow>(
          request,
          pipePath,
          {
            project: slug,
            bucketId,
            repos: repoFilter(repos),
            ...toTinybirdRange(current),
            granularity,
            activity_type: activityType,
            includeCodeContributions,
            includeCollaborations,
            // The widget always counts forks and stars as activity, so the flag stays off here too.
            onlyContributions: false,
          },
          isRetentionRow,
        ),
      );

      return { data: (rows ?? []).map(toRetentionBucket) };
    },
  );
};

export default contributorRetentionRoutes;
