// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { activityFilterParams, fetchPipe, withBucket } from '../../../clients/tinybird.js';
import { toGroups } from '../../../lib/dependency.js';
import {
  isOrganizationRow,
  Organization,
  organizationsLeaderboardPath,
  toOrganization,
  type OrganizationRow,
} from '../../../lib/organizations.js';
import { currentPeriod } from '../../../lib/period.js';
import { ActivityFilterQuery, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/organization_dependency.json';

interface DependencyRow {
  contributionPercentageRunningTotal: number;
  totalOrganizationCount: number;
}

const isDependencyRow = (row: DependencyRow) =>
  typeof row.contributionPercentageRunningTotal === 'number' &&
  Number.isSafeInteger(row.totalOrganizationCount) &&
  row.totalOrganizationCount >= 0;

const TopOrganizations = Type.Object(
  {
    count: Type.Integer({ description: 'Organizations in the top group (count), at most 10.' }),
    contributionPercentage: Type.Number({
      description:
        "The top group's combined share of the contributions attributed to any organization in the period that match the filters, in percent, rounded to two decimals: 51 or more, unless the group is the 10-organization cap. 0 when the period has no such contributions.",
    }),
  },
  {
    description:
      'The smallest set of organizations, taken from the most contributions down, whose shares together reach 51% of the contributions attributed to any organization in the period.',
  },
);

const OtherOrganizations = Type.Object(
  {
    count: Type.Integer({
      description:
        'Organizations with a matching contribution in the period outside the top group (count): all of them minus `topOrganizations.count`, never below 0.',
    }),
    contributionPercentage: Type.Number({
      description:
        'Share of the contributions attributed to any organization in the period that match the filters made outside the top group: 100 minus `topOrganizations.contributionPercentage`, in percent, rounded to two decimals. 0 when the period has no such contributions.',
    }),
  },
  { description: 'Every other organization with a matching contribution in the period.' },
);

const OrganizationDependency = Type.Object({
  topOrganizations: TopOrganizations,
  otherOrganizations: OtherOrganizations,
  data: Type.Array(Organization, {
    description:
      'The five organizations with the most contributions in the period, most first, ranked as the organization leaderboard ranks them. Fewer when the period has fewer organizations. An unknown project gets an empty list.',
  }),
});

const organizationDependencyRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/organization-dependency',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get the organization dependency',
        description:
          "Returns the project's organization dependency in the period: how many organizations make up the top group and their combined share of contributions, the count and share of all other organizations, and the five organizations with the most contributions. " +
          'The top group is the smallest set of organizations, taken from the most contributions down, whose shares together reach 51% of the contributions attributed to organizations in the period; its share is their running total at that point, so it is usually a little above 51%. ' +
          'Only the 10 organizations with the most contributions are considered: when together they hold less than 51%, the top group is those 10 and its share stays below 51%. ' +
          'The top five are ranked by contributions, most first, and organizations with the same count are ordered by an internal organization ID, as in the organization leaderboard. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today. ' +
          'An unknown project, or a period without matching contributions, returns zero counts and shares and an empty `data` list. Organization identity fields are provisional in /v1-alpha.',
        params: ProjectSlugParams,
        querystring: ActivityFilterQuery,
        response: { 200: OrganizationDependency },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const current = currentPeriod(request.query);

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared = activityFilterParams(slug, bucketId, request.query, current);

        return Promise.all([
          // Insights sends no limit, so the pipe finds the top group among the leaderboard's
          // default 10 organizations.
          fetchPipe<DependencyRow>(request, pipePath, shared, isDependencyRow),
          fetchPipe<OrganizationRow>(
            request,
            organizationsLeaderboardPath,
            { ...shared, limit: 5, offset: 0 },
            isOrganizationRow,
          ),
        ]);
      });
      const [dependencyRows, leaderboardRows] = rows ?? [[], []];
      const groups = toGroups(dependencyRows, (row) => row.totalOrganizationCount);

      // organizations_leaderboard orders by count, then organization id, both descending, in its
      // only node, so rows arrive ranked.
      return {
        topOrganizations: groups.top,
        otherOrganizations: groups.other,
        data: leaderboardRows.map(toOrganization),
      };
    },
  );
};

export default organizationDependencyRoutes;
