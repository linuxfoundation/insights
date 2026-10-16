// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchOrganizationYears, OrganizationParams } from '../../../lib/organizations.js';
import { BucketBounds } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/org_page_activities_timeseries.json';

const OrganizationContributions = Type.Object(
  {
    data: Type.Array(
      Type.Object({
        ...BucketBounds.properties,
        contributions: Type.Integer({
          minimum: 0,
          description:
            "Code contributions (commits, pull requests and code reviews) by the organization's contributors in the year (count).",
        }),
      }),
      {
        description:
          'One entry per calendar year with contributions, from January 1 ten years ago to today, ascending by `startDate`. Years without contributions are left out, and the current year counts only up to the latest daily refresh. Empty when the organization has no code contributions in that time.',
      },
    ),
  },
  { title: 'OrganizationContributions' },
);

const contributionsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/organizations/:slug/contributions',
    {
      schema: {
        tags: ['Organizations'],
        summary: 'Get the yearly contributions of an organization',
        description:
          "Returns the code contributions by the organization's contributors per calendar year over the last ten years, as the Contributions chart of the organization page shows them. " +
          'The figures are recomputed once a day. ' +
          'An unknown organization, or one whose affiliations are blocked, returns 404.',
        params: OrganizationParams,
        response: { 200: OrganizationContributions },
      },
    },
    async (request) => {
      const years = await fetchOrganizationYears(
        request,
        request.params.slug,
        pipePath,
        'activityCount',
      );
      return {
        data: years.map(({ startDate, endDate, count }) => ({
          startDate,
          endDate,
          contributions: count,
        })),
      };
    },
  );
};

export default contributionsRoutes;
