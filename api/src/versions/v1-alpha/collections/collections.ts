// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { listCollections, type CollectionSortField } from '../../../lib/collections-db.js';
import { Collection, CollectionType, toCollection } from '../../../lib/collections.js';
import { pipeWindow, requestedPage, toPage } from '../../../lib/pagination.js';
import { dataEnum } from '../../../lib/security.js';
import { paginated, PaginationQuery } from '../../../schemas/common.js';

const sortOptions = [
  'name_asc',
  'name_desc',
  'createdAt_asc',
  'createdAt_desc',
  'projectCount_asc',
  'projectCount_desc',
  'likeCount_asc',
  'likeCount_desc',
  'starred_asc',
  'starred_desc',
] as const;

const defaultSort = 'name_asc';

// Category ids are UUIDs, so a typo is a 400 rather than a failed query.
const uuid = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const categoriesPattern = `^${uuid}(,${uuid})*$`;

const Query = Type.Object({
  search: Type.Optional(
    Type.String({
      description: 'Case-insensitive text to find in the collection name. Empty means no filter.',
    }),
  ),
  categories: Type.Optional(
    Type.String({
      pattern: categoriesPattern,
      description:
        'Comma-separated category ids. Returns collections in any of them, for example `id1,id2`.',
    }),
  ),
  type: Type.Optional(CollectionType),
  sort: Type.Optional(
    dataEnum(
      sortOptions,
      `Sort order as \`field_direction\`. Fields: name, createdAt, projectCount, likeCount, starred. Defaults to \`${defaultSort}\`. \`starred\` lists starred collections first, then by name, in either direction.`,
    ),
  ),
  ...PaginationQuery.properties,
});

const Collections = paginated(Collection, {
  data: 'Up to `pageSize` public collections in the requested order.',
});

function parseSort(sort: (typeof sortOptions)[number]) {
  const [field, direction] = sort.split('_') as [CollectionSortField, 'asc' | 'desc'];
  return { field, direction };
}

const collectionsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/collections',
    {
      schema: {
        tags: ['Collections'],
        summary: 'List collections',
        description:
          'Returns public collections, one page at a time, optionally filtered by name, category and type. ' +
          'Sorting by `starred` follows the collection `starred` flag only. ' +
          'The Insights website also pins a configured set of highlighted collections to the top of the curated list; this endpoint does not.',
        querystring: Query,
        response: { 200: Collections },
      },
    },
    async (request) => {
      const { search, categories, type, sort = defaultSort } = request.query;
      const page = requestedPage(request.query);
      const window = pipeWindow(page);

      const rows = await listCollections(request, {
        search,
        categoryIds: categories?.split(','),
        type,
        sort: parseSort(sort),
        limit: window.limit,
        offset: window.offset,
      });
      return toPage(rows.map(toCollection), page);
    },
  );
};

export default collectionsRoutes;
