// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, withBucket } from '../../../clients/tinybird.js';
import {
  BadgeTier,
  badgeOrder,
  isLeaderboardRow,
  LeaderboardType,
  toBadge,
} from '../../../lib/badges.js';
import { ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/leaderboards.json';

// The pipe pages at 20 rows and holds one row per type for a project, so one page covers them all.
const pageSize = 100;

const Badge = Type.Object({
  leaderboardType: LeaderboardType,
  tier: BadgeTier,
  rank: Type.Integer({
    description: 'Position of the project on the leaderboard, 1 being the top.',
  }),
  totalCount: Type.Integer({ description: 'Number of projects ranked on the leaderboard.' }),
  percentile: Type.Integer({
    description:
      'Share of ranked projects at or above this rank, as a percent from 1 to 50, rounded up.',
  }),
});

const Badges = Type.Object({
  data: Type.Array(Badge, {
    description:
      'One entry per leaderboard where the project ranks in the top 50%, by tier from `black` down, then by `percentile`, then by `leaderboardType`. An unknown project gets an empty list.',
  }),
});

const badgesRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/overview/badges',
    {
      schema: {
        tags: ['Overview'],
        summary: 'List the badges of a project',
        description:
          'Returns the leaderboards where the project ranks in the top 50%, with its rank, the number of ranked projects, its percentile and the badge tier. ' +
          'Badges come from nine leaderboard types; other leaderboards are left out.',
        params: ProjectSlugParams,
        response: { 200: Badges },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe(request, pipePath, { slug, bucketId, pageSize }, isLeaderboardRow),
      );
      const data = (rows ?? []).flatMap((row) => toBadge(row) ?? []).sort(badgeOrder);
      return { data };
    },
  );
};

export default badgesRoutes;
