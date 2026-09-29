// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchCountedPipe } from '../../../clients/tinybird.js';
import {
  escapeLike,
  isEntryRow,
  LeaderboardEntry,
  LeaderboardType,
  leaderboardTypes,
  LeaderboardTypeInfo,
  toEntry,
  type LeaderboardRow,
} from '../../../lib/leaderboards.js';
import { pipePages, requestedPage, toCountedPage } from '../../../lib/pagination.js';
import { paginated, PaginationQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/leaderboards.json';

const Params = Type.Object({ type: LeaderboardType });

const Query = Type.Object({
  search: Type.Optional(
    Type.String({
      description:
        'Keeps entries whose `name` contains this text, ignoring case. Ranks stay those of the whole leaderboard.',
    }),
  ),
  collectionSlug: Type.Optional(
    Type.String({
      description:
        'Keeps entries that belong to the collection with this slug. Ranks stay those of the whole leaderboard.',
    }),
  ),
  ...PaginationQuery.properties,
});

const Leaderboard = Type.Object(
  {
    ...LeaderboardTypeInfo.properties,
    ...paginated(LeaderboardEntry, {
      data: 'Up to `pageSize` entries, by rank. Empty when no entry matches the filters.',
    }).properties,
  },
  { title: 'Leaderboard' },
);

const leaderboardRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/leaderboards/:type',
    {
      schema: {
        tags: ['Leaderboards'],
        summary: 'List the entries of one leaderboard',
        description:
          'Returns one leaderboard with its description, metric and unit, and its entries by rank, one page at a time. ' +
          '`search` matches part of the entry name, ignoring case, and `collectionSlug` keeps the entries of one collection. ' +
          'Both filters keep the global ranks, so a filtered page can start at any rank, and `totalCount` stays the size of the whole leaderboard. ' +
          'Pages follow position, as the Pagination guide describes, and a cursor keeps its position when `pageSize` changes.',
        params: Params,
        querystring: Query,
        response: { 200: Leaderboard },
      },
    },
    async (request) => {
      const { type } = request.params;
      const { search, collectionSlug } = request.query;
      const page = requestedPage(request.query);
      const { pages, skip } = pipePages(page);

      const chunks = await Promise.all(
        pages.map((number) =>
          fetchCountedPipe<LeaderboardRow>(
            request,
            pipePath,
            {
              leaderboardType: type,
              page: number,
              pageSize: page.pageSize,
              search: search ? escapeLike(search) : undefined,
              collectionSlug: collectionSlug || undefined,
            },
            isEntryRow,
          ),
        ),
      );
      const fetched = chunks.flatMap((chunk) => chunk.rows);
      const rows = fetched.slice(skip, skip + page.pageSize);
      // A total below the rows already seen contradicts the page, so it is treated as missing. Then a
      // full last pipe page is the only sign that more rows follow.
      const last = chunks[chunks.length - 1]!;
      const seen = pages[0]! * page.pageSize + fetched.length;
      const reported = chunks[0]!.total;
      const total =
        reported !== undefined && reported >= seen
          ? reported
          : seen + (last.rows.length === page.pageSize ? 1 : 0);

      const info = leaderboardTypes.find((entry) => entry.type === type)!;
      return { ...info, ...toCountedPage(rows.map(toEntry), page, total) };
    },
  );
};

export default leaderboardRoutes;
