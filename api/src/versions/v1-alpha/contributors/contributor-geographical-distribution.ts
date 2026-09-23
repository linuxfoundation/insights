// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { geoDistribution } from '../../../lib/geo-distribution.js';
import { getPreviousDates, toTinybirdRange } from '../../../lib/period.js';
import {
  ActivityPlatform,
  ActivityType,
  ContributionFlags,
  DateRangeQuery,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/contributors_geo_distribution.json';

const { isRow, toItem, Item } = geoDistribution('contributor');

const Query = Type.Object({
  ...DateRangeQuery.properties,
  platform: Type.Optional(ActivityPlatform),
  activityType: Type.Optional(ActivityType),
  ...ContributionFlags.properties,
});

const GeographicalDistribution = Type.Object({
  data: Type.Array(Item, {
    description:
      'One entry per country with at least one active contributor, most contributors first; countries with the same count come in no set order. The list is not paginated: it holds at most one entry per country, plus `Unknown`. An unknown project gets an empty list.',
  }),
});

const contributorGeographicalDistributionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/contributor-geographical-distribution',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get the geographical distribution of contributors',
        description:
          "Returns, for each country, how many of the project's active contributors in the period are located there and their share of all active contributors. " +
          'An active contributor is a person with at least one activity in the period that matches the filters, of a kind the contribution flags select: code contributions unless `includeCodeContributions` is false, and collaborations when `includeCollaborations` is true. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today. ' +
          'An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: GeographicalDistribution },
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

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe(
          request,
          pipePath,
          {
            project: slug,
            bucketId,
            repos: repoFilter(repos),
            ...toTinybirdRange(current),
            platform,
            activity_type: activityType,
            includeCodeContributions,
            includeCollaborations,
          },
          isRow,
        ),
      );
      return { data: (rows ?? []).map(toItem) };
    },
  );
};

export default contributorGeographicalDistributionRoutes;
