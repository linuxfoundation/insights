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

const pipePath = '/v0/pipes/organization_retention.json';

const OrganizationRetention = retentionResponse('organization');

const organizationRetentionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/organization-retention',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get organization retention',
        description:
          "Returns, per granularity bucket, the share of the previous bucket's organizations that were active again in this bucket. " +
          'Activity counts the kinds the contribution flags select, as on the other Contributors endpoints, so stars and forks never count. ' +
          'The comparison is bucket over bucket, not against the whole period. `repos` narrows it to those repositories. ' +
          'Without dates the period runs from 2010-01-01 to today, and it runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. ' +
          'An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: RetentionQuery,
        response: { 200: OrganizationRetention },
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
          },
          isRetentionRow,
        ),
      );

      return { data: (rows ?? []).map(toRetentionBucket) };
    },
  );
};

export default organizationRetentionRoutes;
