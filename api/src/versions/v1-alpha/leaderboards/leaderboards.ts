// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import {
  isEntryRow,
  LeaderboardEntry,
  leaderboardTypes,
  LeaderboardTypeInfo,
  toEntry,
  type LeaderboardRow,
} from '../../../lib/leaderboards.js';
import { isString } from '../../../lib/security.js';

const pipePath = '/v0/pipes/leaderboards.json';

const maxTop = 20;
const defaultTop = 5;

type Row = LeaderboardRow & { leaderboardType: string };

const isRow = (row: unknown): row is Row =>
  isEntryRow(row) && isString((row as { leaderboardType?: unknown }).leaderboardType);

const Query = Type.Object({
  top: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: maxTop,
      default: defaultTop,
      description: `Entries to return per leaderboard, from 1 to ${maxTop}. Tied ranks can return more.`,
    }),
  ),
});

const LeaderboardSummary = Type.Object(
  {
    ...LeaderboardTypeInfo.properties,
    entries: Type.Array(LeaderboardEntry, {
      description:
        'Top entries of the leaderboard, by rank. Empty when the latest snapshot has none.',
    }),
  },
  { title: 'LeaderboardSummary' },
);

const Leaderboards = Type.Object({
  data: Type.Array(LeaderboardSummary, {
    description: 'Every leaderboard type, in the order the Insights leaderboards page lists them.',
  }),
});

const leaderboardsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/leaderboards',
    {
      schema: {
        tags: ['Leaderboards'],
        summary: 'List the leaderboards with their top entries',
        description:
          `Returns every leaderboard type with its description, metric and unit, and its entries ranked up to \`top\` (\`top\` at most ${maxTop}). ` +
          'Tied ranks can return more than `top` entries. Each type reads its own latest daily snapshot, so two types can be a day apart.',
        querystring: Query,
        response: { 200: Leaderboards },
      },
    },
    async (request) => {
      const rows = await fetchPipe<Row>(
        request,
        pipePath,
        { maxRank: request.query.top ?? defaultTop },
        isRow,
      );
      const data = leaderboardTypes.map((info) => ({
        ...info,
        entries: rows.filter((row) => row.leaderboardType === info.type).map(toEntry),
      }));
      return { data };
    },
  );
};

export default leaderboardsRoutes;
