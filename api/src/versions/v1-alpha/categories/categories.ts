// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import { pipeWindow, requestedPage, toPage } from '../../../lib/pagination.js';
import { isString } from '../../../lib/security.js';
import { paginated, PaginationQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/category_list.json';

// The pipe pages rows, so a group could straddle two pipe pages. One call for every row (about
// 350 today) lets the route page over whole groups instead.
const allRows = 5000;

interface Row {
  id: string;
  name: string;
  categoryGroupId: string;
  categoryGroupName: string;
}

const isRow = (row: Row) =>
  isString(row.id) &&
  isString(row.name) &&
  isString(row.categoryGroupId) &&
  isString(row.categoryGroupName);

// Compares character codes so the order is the same on every host, where localeCompare follows
// the host locale.
const compareCharCodes = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const Query = Type.Object({
  search: Type.Optional(
    Type.String({
      description:
        'Keeps categories whose `name` contains this text, ignoring case. Groups left without a matching category are dropped.',
    }),
  ),
  type: Type.Optional(
    Type.String({
      description: 'Keeps the groups of this type, for example `vertical` or `horizontal`.',
    }),
  ),
  ...PaginationQuery.properties,
});

const CategoryGroup = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the category group.' }),
    name: Type.String({ description: 'Display name of the category group.' }),
    categories: Type.Array(
      Type.Object({
        id: Type.String({ description: 'Identifier of the category.' }),
        name: Type.String({ description: 'Display name of the category.' }),
      }),
      { description: 'Categories of the group that match the filters, ordered by name.' },
    ),
  },
  { title: 'CategoryGroup' },
);

const Categories = paginated(CategoryGroup, {
  data: 'Up to `pageSize` category groups, ordered by name. Empty when nothing matches the filters.',
});

function groupRows(rows: Row[]) {
  const groups = new Map<string, { id: string; name: string; categories: Row[] }>();
  for (const row of rows) {
    const group = groups.get(row.categoryGroupId) ?? {
      id: row.categoryGroupId,
      name: row.categoryGroupName,
      categories: [],
    };
    group.categories.push(row);
    groups.set(row.categoryGroupId, group);
  }
  return [...groups.values()]
    .sort((a, b) => compareCharCodes(a.name, b.name) || compareCharCodes(a.id, b.id))
    .map((group) => ({
      ...group,
      categories: group.categories
        .sort((a, b) => compareCharCodes(a.name, b.name) || compareCharCodes(a.id, b.id))
        .map(({ id, name }) => ({ id, name })),
    }));
}

const categoryRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/categories',
    {
      schema: {
        tags: ['Collections'],
        summary: 'List the category groups collections are filed under',
        description:
          'Returns category groups, each with its categories, ordered by group name. Use the category ids in the `categories` filter of the collection list. ' +
          '`search` matches part of a category name, ignoring case, and a group appears only with the categories that match; `type` keeps one group type. ' +
          'Pages count groups, so a group is never split across two pages. Pages follow position, as the Pagination guide describes.',
        querystring: Query,
        response: { 200: Categories },
      },
    },
    async (request) => {
      const { search, type } = request.query;
      const page = requestedPage(request.query);

      const rows = await fetchPipe<Row>(
        request,
        pipePath,
        {
          search: search || undefined,
          categoryGroupType: type || undefined,
          page: 0,
          pageSize: allRows,
          orderBy: 'categoryGroupName',
          orderDirection: 'asc',
        },
        isRow,
      );

      const { limit, offset } = pipeWindow(page);
      return toPage(groupRows(rows).slice(offset, offset + limit), page);
    },
  );
};

export default categoryRoutes;
