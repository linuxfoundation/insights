// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchOrganizationYears, OrganizationParams } from '../../../lib/organizations.js';
import { BucketBounds } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/org_page_contributors_timeseries.json';

const OrganizationActiveContributors = Type.Object(
  {
    data: Type.Array(
      Type.Object({
        ...BucketBounds.properties,
        contributors: Type.Integer({
          minimum: 0,
          description:
            "The organization's contributors with code contributions (commits, pull requests and code reviews) in the year (count). A person active in several years counts in each.",
        }),
      }),
      {
        description:
          'One entry per calendar year with active contributors, from January 1 ten years ago to today, ascending by `startDate`. Years without active contributors are left out, and the current year counts only up to the latest daily refresh. Empty when the organization has no code contributions in that time.',
      },
    ),
  },
  { title: 'OrganizationActiveContributors' },
);

const activeContributorsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/organizations/:slug/active-contributors',
    {
      schema: {
        tags: ['Organizations'],
        summary: 'Get the yearly active contributors of an organization',
        description:
          "Returns how many of the organization's contributors made code contributions in each calendar year over the last ten years, as the Active Contributors chart of the organization page shows them. " +
          'The figures are recomputed once a day. ' +
          'An unknown organization, or one whose affiliations are blocked, returns 404.',
        params: OrganizationParams,
        response: { 200: OrganizationActiveContributors },
      },
    },
    async (request) => {
      const years = await fetchOrganizationYears(
        request,
        request.params.slug,
        pipePath,
        'contributorCount',
      );
      return {
        data: years.map(({ startDate, endDate, count }) => ({
          startDate,
          endDate,
          contributors: count,
        })),
      };
    },
  );
};

export default activeContributorsRoutes;
