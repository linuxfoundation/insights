// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  isOrganizationRow,
  Organization,
  organizationsLeaderboardPath,
  toOrganization,
  type OrganizationRow,
} from '../../../lib/organizations.js';
import { pipeWindow, requestedPage, toPage } from '../../../lib/pagination.js';
import { getPreviousDates, toTinybirdRange } from '../../../lib/period.js';
import {
  ActivityPlatform,
  ActivityType,
  ContributionFlags,
  DateRangeQuery,
  paginated,
  PaginationQuery,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const Query = Type.Object({
  ...DateRangeQuery.properties,
  platform: Type.Optional(ActivityPlatform),
  activityType: Type.Optional(ActivityType),
  ...ContributionFlags.properties,
  ...PaginationQuery.properties,
});

const OrganizationLeaderboard = paginated(Organization, {
  data: 'Up to `pageSize` organizations, ranked by contributions, most first. An unknown project gets an empty list.',
});

const organizationLeaderboardRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/organization-leaderboard',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get the organization leaderboard',
        description:
          "Returns the organizations contributing to the project, ranked by their contributions in the period, most first, with each one's contribution count and share, one page at a time. " +
          'Organizations with the same count are ordered by an internal organization ID, so tied organizations keep their order from one page to the next. ' +
          'Pages follow rank position, as the Pagination guide describes: an organization whose rank changes between your requests can be skipped or repeated. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today. ' +
          'An unknown project returns an empty `data` list. Organization identity fields are provisional in /v1-alpha.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: OrganizationLeaderboard },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const {
        repos,
        startDate,
        endDate,
        platform,
        activityType,
        includeCodeContributions,
        includeCollaborations,
      } = request.query;
      // Only the current range is used; getPreviousDates fills its defaults and checks its dates.
      const { current } = getPreviousDates(startDate, endDate);
      const page = requestedPage(request.query);

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<OrganizationRow>(
          request,
          organizationsLeaderboardPath,
          {
            project: slug,
            bucketId,
            repos: repoFilter(repos),
            ...toTinybirdRange(current),
            platform,
            activity_type: activityType,
            includeCodeContributions,
            includeCollaborations,
            ...pipeWindow(page),
          },
          isOrganizationRow,
        ),
      );
      // The pipe pages by count, then organization id, both descending, in its only node, so rows
      // arrive in the order toPage needs.
      return toPage((rows ?? []).map(toOrganization), page);
    },
  );
};

export default organizationLeaderboardRoutes;
