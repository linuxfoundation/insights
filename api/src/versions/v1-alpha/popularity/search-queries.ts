// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, withBucket } from '../../../clients/tinybird.js';
import { currentPeriod, toIsoUtc, toTinybirdRange, utcMidnight } from '../../../lib/period.js';
import { DateRangeQuery, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/search_volume.json';

interface Row {
  dataTimestamp: string;
  volume: number;
}

// Date rolls an impossible day like 2024-02-31 into the next month, so the round trip must match.
const isDay = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const time = Date.parse(utcMidnight(value));
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
};

const isRow = (row: Row) =>
  isDay(row.dataTimestamp) && Number.isSafeInteger(row.volume) && row.volume >= 0;

const Query = Type.Object({
  startDate: DateRangeQuery.properties.startDate,
  endDate: Type.Optional(
    Type.String({
      format: 'date',
      description:
        'End of the range, as a UTC calendar day (YYYY-MM-DD). Inclusive: a month dated on this day is part of the result. The latest accepted day is today in UTC.',
    }),
  ),
});

const SearchQueries = Type.Object({
  data: Type.Array(
    Type.Object({
      startDate: Type.String({ format: 'date-time', description: 'First day of the month, UTC.' }),
      endDate: Type.String({ format: 'date-time', description: 'Last day of the month, UTC.' }),
      queryCount: Type.Integer({ description: 'Google searches for the project name that month.' }),
    }),
    { description: 'One row per month, oldest first. Empty for an unknown project.' },
  ),
});

const lastDayOfMonth = (day: string) => {
  const date = new Date(utcMidnight(day));
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
};

const toMonth = (row: Row) => ({
  startDate: toIsoUtc(row.dataTimestamp),
  endDate: utcMidnight(lastDayOfMonth(row.dataTimestamp)),
  queryCount: row.volume,
});

const searchQueriesRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/popularity/search-queries',
    {
      schema: {
        tags: ['Popularity'],
        summary: 'Get search queries',
        description:
          'Returns the monthly Google Search volume for the project name, one row per month, oldest first. The volume covers the whole project, so there is no repository filter. A month is included when its first day falls between `startDate` and `endDate`, both inclusive, so a month dated on `endDate` is part of the result. Without dates the range runs from 2010-01-01 to today. An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: SearchQueries },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const range = toTinybirdRange(currentPeriod(request.query));

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<Row>(request, pipePath, { project: slug, bucketId, ...range }, isRow),
      );
      if (!rows) {
        return { data: [] };
      }

      // The pipe returns its rows in no set order.
      const months = rows.map(toMonth);
      months.sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0));
      return { data: months };
    },
  );
};

export default searchQueriesRoutes;
