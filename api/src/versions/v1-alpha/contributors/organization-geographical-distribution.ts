// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { activityFilterParams, fetchPipe } from '../../../clients/tinybird.js';
import { geoDistribution } from '../../../lib/geo-distribution.js';
import { currentPeriod } from '../../../lib/period.js';
import { widgetRoutes } from '../../../lib/widget-scope.js';
import { ActivityFilterQuery, CollectionActivityFilterQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/organizations_geo_distribution.json';

const { isRow, toItem, Item } = geoDistribution('organization');

const listing =
  'One entry per country with at least one active organization, most organizations first; countries with the same count come in no set order. The list is not paginated: it holds at most one entry per country, plus `Unknown`.';

const GeographicalDistribution = Type.Object({
  data: Type.Array(Item, { description: `${listing} An unknown project gets an empty list.` }),
});

const CollectionGeographicalDistribution = Type.Object({
  data: Type.Array(Item, { description: listing }),
});

const activity =
  'An organization is active when at least one activity attributed to it falls in the period, matches the filters, and is of a kind the contribution flags select: code contributions unless `includeCodeContributions` is false, and collaborations when `includeCollaborations` is true. ' +
  'An organization is located by its own record, the country set on it, else its headquarters location, not by where its contributors are. ' +
  'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today.';

const organizationGeographicalDistributionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  widgetRoutes(scope, {
    path: 'contributors/organization-geographical-distribution',
    tags: ['Contributors'],
    summary: 'Get the geographical distribution of organizations',
    project: {
      description:
        "Returns, for each country, how many of the project's active organizations in the period are located there and their share of all active organizations. " +
        activity +
        ' An unknown project returns an empty `data` list.',
      querystring: ActivityFilterQuery,
      response: GeographicalDistribution,
    },
    collection: {
      description:
        "Returns, for each country, how many of the collection's active organizations in the period are located there and their share of all active organizations. " +
        activity,
      querystring: CollectionActivityFilterQuery,
      response: CollectionGeographicalDistribution,
    },
    handler: async (request, withTarget) => {
      const current = currentPeriod(request.query);

      const rows = await withTarget((target) =>
        fetchPipe(request, pipePath, activityFilterParams(target, request.query, current), isRow),
      );
      return { data: (rows ?? []).map(toItem) };
    },
  });
};

export default organizationGeographicalDistributionRoutes;
