// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { activityFilterParams, fetchPipe, withBucket } from '../../../clients/tinybird.js';
import { geoDistribution } from '../../../lib/geo-distribution.js';
import { currentPeriod } from '../../../lib/period.js';
import { ActivityFilterQuery, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/organizations_geo_distribution.json';

const { isRow, toItem, Item } = geoDistribution('organization');

const GeographicalDistribution = Type.Object({
  data: Type.Array(Item, {
    description:
      'One entry per country with at least one active organization, most organizations first; countries with the same count come in no set order. The list is not paginated: it holds at most one entry per country, plus `Unknown`. An unknown project gets an empty list.',
  }),
});

const organizationGeographicalDistributionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/organization-geographical-distribution',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get the geographical distribution of organizations',
        description:
          "Returns, for each country, how many of the project's active organizations in the period are located there and their share of all active organizations. " +
          'An organization is active when at least one activity attributed to it falls in the period, matches the filters, and is of a kind the contribution flags select: code contributions unless `includeCodeContributions` is false, and collaborations when `includeCollaborations` is true. ' +
          'An organization is located by its own record, the country set on it, else its headquarters location, not by where its contributors are. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today. ' +
          'An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: ActivityFilterQuery,
        response: { 200: GeographicalDistribution },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const current = currentPeriod(request.query);

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe(
          request,
          pipePath,
          activityFilterParams(slug, bucketId, request.query, current),
          isRow,
        ),
      );
      return { data: (rows ?? []).map(toItem) };
    },
  );
};

export default organizationGeographicalDistributionRoutes;
