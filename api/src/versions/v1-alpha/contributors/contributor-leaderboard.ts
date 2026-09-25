// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { activityFilterParams, fetchPipe, withBucket } from '../../../clients/tinybird.js';
import {
  Contributor,
  type ContributorRow,
  contributorsLeaderboardPath,
  inLeaderboardOrder,
  isContributorRow,
  toContributor,
} from '../../../lib/contributors.js';
import { pipeWindow, requestedPage, toPage } from '../../../lib/pagination.js';
import { currentPeriod } from '../../../lib/period.js';
import {
  ActivityFilterQuery,
  paginated,
  PaginationQuery,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const Query = Type.Object({
  ...ActivityFilterQuery.properties,
  ...PaginationQuery.properties,
});

const ContributorLeaderboard = paginated(Contributor, {
  data: 'Up to `pageSize` contributors, ranked by contributions, most first. An unknown project gets an empty list.',
});

const contributorLeaderboardRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/contributor-leaderboard',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get the contributor leaderboard',
        description:
          "Returns the project's contributors ranked by their contributions in the period, most first, with each one's contribution count and share, one page at a time. " +
          'Contributors with the same count are ordered by an internal contributor ID, so tied contributors keep their order from one page to the next. ' +
          'Pages follow rank position, as the Pagination guide describes: a contributor whose rank changes between your requests can be skipped or repeated. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today. ' +
          'An unknown project returns an empty `data` list. Contributor identity fields are provisional in /v1-alpha.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: ContributorLeaderboard },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const current = currentPeriod(request.query);
      const page = requestedPage(request.query);

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<ContributorRow>(
          request,
          contributorsLeaderboardPath,
          {
            ...activityFilterParams(slug, bucketId, request.query, current),
            ...pipeWindow(page),
          },
          isContributorRow,
        ),
      );
      return toPage((rows ?? []).sort(inLeaderboardOrder).map(toContributor), page);
    },
  );
};

export default contributorLeaderboardRoutes;
