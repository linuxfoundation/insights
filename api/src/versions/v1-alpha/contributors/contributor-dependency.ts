// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  Contributor,
  type ContributorRow,
  contributorsLeaderboardPath,
  inLeaderboardOrder,
  isContributorRow,
  toContributor,
} from '../../../lib/contributors.js';
import { getPreviousDates, toTinybirdRange } from '../../../lib/period.js';
import {
  ActivityPlatform,
  ActivityType,
  ContributionFlags,
  DateRangeQuery,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/contributor_dependency.json';

interface DependencyRow {
  contributionPercentageRunningTotal: number;
  totalContributorCount: number;
}

const isDependencyRow = (row: DependencyRow) =>
  typeof row.contributionPercentageRunningTotal === 'number' &&
  Number.isSafeInteger(row.totalContributorCount) &&
  row.totalContributorCount >= 0;

// The pipe sums two-decimal shares in Float64, which leaves noise such as 51.370000000000005.
const toTwoDecimals = (value: number) => Math.round(value * 100) / 100;

function toGroups(rows: DependencyRow[]) {
  if (rows.length === 0) {
    return {
      topContributors: { count: 0, contributionPercentage: 0 },
      otherContributors: { count: 0, contributionPercentage: 0 },
    };
  }
  // The pipe's row order is unreliable, so the share is the largest running total rather than
  // the last row's.
  const topShare = toTwoDecimals(
    Math.max(...rows.map((row) => row.contributionPercentageRunningTotal)),
  );
  return {
    topContributors: { count: rows.length, contributionPercentage: topShare },
    // Every row carries the same total.
    otherContributors: {
      count: Math.max(0, rows[0].totalContributorCount - rows.length),
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
        querystring: Query,
        response: { 200: ContributorDependency },
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

      return {
        ...toGroups(dependencyRows),
        data: leaderboardRows.sort(inLeaderboardOrder).map(toContributor),
      };
    },
  );
};

export default contributorDependencyRoutes;
