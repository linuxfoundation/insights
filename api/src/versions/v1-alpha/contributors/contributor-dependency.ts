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
import { toGroups } from '../../../lib/dependency.js';
import { currentPeriod } from '../../../lib/period.js';
import { ActivityFilterQuery, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/contributor_dependency.json';

interface DependencyRow {
  contributionPercentageRunningTotal: number;
  totalContributorCount: number;
}

const isDependencyRow = (row: DependencyRow) =>
  typeof row.contributionPercentageRunningTotal === 'number' &&
  Number.isSafeInteger(row.totalContributorCount) &&
  row.totalContributorCount >= 0;

const TopContributors = Type.Object(
  {
    count: Type.Integer({ description: 'Contributors in the top group (count), at most 100.' }),
    contributionPercentage: Type.Number({
      description:
        "The top group's combined share of all contributions in the period that match the filters, in percent, rounded to two decimals: 51 or more, unless the group is the 100-contributor cap. 0 when there are no contributions.",
    }),
  },
  {
    description:
      'The smallest set of contributors, taken from the most contributions down, whose shares together reach 51% of the contributions in the period.',
  },
);

const OtherContributors = Type.Object(
  {
    count: Type.Integer({
      description:
        'Contributors with a matching contribution in the period outside the top group (count): all of them minus `topContributors.count`, never below 0.',
    }),
    contributionPercentage: Type.Number({
      description:
        'Share of the contributions in the period that match the filters made outside the top group: 100 minus `topContributors.contributionPercentage`, in percent, rounded to two decimals. 0 when there are no contributions.',
    }),
  },
  { description: 'Every other contributor with a matching contribution in the period.' },
);

const ContributorDependency = Type.Object({
  topContributors: TopContributors,
  otherContributors: OtherContributors,
  data: Type.Array(Contributor, {
    description:
      'The five contributors with the most contributions in the period, most first, ranked as the contributor leaderboard ranks them. Fewer when the period has fewer contributors. An unknown project gets an empty list.',
  }),
});

const contributorDependencyRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/contributor-dependency',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get the contributor dependency',
        description:
          "Returns the project's contributor dependency in the period, also called the bus factor: how many contributors make up the top group and their combined share of contributions, the count and share of all other contributors, and the five contributors with the most contributions. " +
          'The top group is the smallest set of contributors, taken from the most contributions down, whose shares together reach 51% of the contributions in the period; its share is their running total at that point, so it is usually a little above 51%. ' +
          'Only the 100 contributors with the most contributions are considered: when together they hold less than 51%, the top group is those 100 and its share stays below 51%. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today. ' +
          'An unknown project, or a period without matching contributions, returns zero counts and shares and an empty `data` list. Contributor identity fields are provisional in /v1-alpha.',
        params: ProjectSlugParams,
        querystring: ActivityFilterQuery,
        response: { 200: ContributorDependency },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const current = currentPeriod(request.query);

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared = activityFilterParams(slug, bucketId, request.query, current);

        return Promise.all([
          // The pipe finds the top group among the leaderboard's first `limit` contributors
          // (default 10); Insights asks for 100 to reach 51%.
          fetchPipe<DependencyRow>(request, pipePath, { ...shared, limit: 100 }, isDependencyRow),
          fetchPipe<ContributorRow>(
            request,
            contributorsLeaderboardPath,
            { ...shared, limit: 5, offset: 0 },
            isContributorRow,
          ),
        ]);
      });
      const [dependencyRows, leaderboardRows] = rows ?? [[], []];
      const groups = toGroups(dependencyRows, (row) => row.totalContributorCount);

      return {
        topContributors: groups.top,
        otherContributors: groups.other,
        data: leaderboardRows.sort(inLeaderboardOrder).map(toContributor),
      };
    },
  );
};

export default contributorDependencyRoutes;
