// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  isOrganizationRow,
  Organization,
  organizationsLeaderboardPath,
  toOrganization,
  type OrganizationRow,
} from '../../../lib/organizations.js';
import { getPreviousDates, toTinybirdRange } from '../../../lib/period.js';
import {
  ActivityPlatform,
  ActivityType,
  ContributionFlags,
  DateRangeQuery,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/organization_dependency.json';

interface DependencyRow {
  contributionPercentageRunningTotal: number;
  totalOrganizationCount: number;
}

const isDependencyRow = (row: DependencyRow) =>
  typeof row.contributionPercentageRunningTotal === 'number' &&
  Number.isSafeInteger(row.totalOrganizationCount) &&
  row.totalOrganizationCount >= 0;

// The pipe sums two-decimal shares in Float64, which leaves noise such as 51.370000000000005.
const toTwoDecimals = (value: number) => Math.round(value * 100) / 100;

function toGroups(rows: DependencyRow[]) {
  if (rows.length === 0) {
    return {
      topOrganizations: { count: 0, contributionPercentage: 0 },
      otherOrganizations: { count: 0, contributionPercentage: 0 },
    };
  }
  // The pipe's outer query has no ORDER BY, so the share is the largest running total rather than
  // the last row's.
  const topShare = toTwoDecimals(
    Math.max(...rows.map((row) => row.contributionPercentageRunningTotal)),
  );
  return {
    topOrganizations: { count: rows.length, contributionPercentage: topShare },
    // Every row carries the same total.
    otherOrganizations: {
      count: Math.max(0, rows[0].totalOrganizationCount - rows.length),
      contributionPercentage: toTwoDecimals(100 - topShare),
    },
  };
}

const Query = Type.Object({
  ...DateRangeQuery.properties,
  platform: Type.Optional(ActivityPlatform),
  activityType: Type.Optional(ActivityType),
  ...ContributionFlags.properties,
});

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
        querystring: Query,
        response: { 200: OrganizationDependency },
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

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          ...toTinybirdRange(current),
          platform,
          activity_type: activityType,
          includeCodeContributions,
          includeCollaborations,
        };

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

      // organizations_leaderboard orders by count, then organization id, both descending, in its
      // only node, so rows arrive ranked.
      return { ...toGroups(dependencyRows), data: leaderboardRows.map(toOrganization) };
    },
  );
};

export default organizationDependencyRoutes;
