// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import { NotFoundError } from '../../../lib/errors.js';
import {
  CollectionProject,
  isCollectionProjectTuple,
  sortQuery,
  toCollectionProject,
  type CollectionProjectTuple,
} from '../../../lib/oss-index.js';
import { pipeWindow, requestedPage, toPage } from '../../../lib/pagination.js';
import { inRange, isCount, isString } from '../../../lib/security.js';
import { PaginationQuery, paginated } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/collections_oss_index.json';
const categoryPipePath = '/v0/pipes/category_list.json';

interface Row {
  id: string;
  name: string;
  slug: string;
  totalContributors: number;
  softwareValue: number;
  avgScore: number;
  projectCount: number;
  topProjects: CollectionProjectTuple[];
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  categoryGroupId: string;
  categoryGroupName: string;
  categoryGroupSlug: string;
  categoryGroupType: string;
}

const isRow = (row: Row) =>
  isString(row.id) &&
  isString(row.name) &&
  isString(row.slug) &&
  isCount(row.totalContributors) &&
  isCount(row.softwareValue) &&
  inRange(row.avgScore, 1) &&
  isCount(row.projectCount) &&
  Array.isArray(row.topProjects) &&
  row.topProjects.every(isCollectionProjectTuple);

const isCategoryRow = (row: CategoryRow) =>
  isString(row.id) &&
  isString(row.name) &&
  isString(row.slug) &&
  isString(row.categoryGroupId) &&
  isString(row.categoryGroupName) &&
  isString(row.categoryGroupSlug) &&
  isString(row.categoryGroupType);

const Query = Type.Object({
  categorySlug: Type.Optional(
    Type.String({
      description:
        'Keeps the collections of this category. An unknown slug answers 404, and the response then includes the category.',
    }),
  ),
  categoryGroupId: Type.Optional(
    Type.String({ description: 'Keeps the collections of this category group.' }),
  ),
  ...sortQuery.properties,
  ...PaginationQuery.properties,
});

const OssIndexCollection = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the collection.' }),
    name: Type.String({ description: 'Display name of the collection.' }),
    slug: Type.String({ description: 'URL slug of the collection.' }),
    totalContributors: Type.Integer({
      minimum: 0,
      description: 'Contributors across the collection.',
    }),
    softwareValue: Type.Integer({ minimum: 0, description: 'Software value of the collection.' }),
    avgScore: Type.Number({
      minimum: 0,
      maximum: 1,
      description: 'Average health score of the collection, from 0 to 1.',
    }),
    projectCount: Type.Integer({ minimum: 0, description: 'Projects in the collection.' }),
    topProjects: Type.Array(CollectionProject, {
      description: 'Leading projects of the collection, ordered by contributors.',
    }),
  },
  { title: 'OssIndexCollection' },
);

const OssIndexCollectionCategory = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the category.' }),
    name: Type.String({ description: 'Display name of the category.' }),
    slug: Type.String({ description: 'URL slug of the category.' }),
    categoryGroupId: Type.String({ description: 'Identifier of the category group.' }),
    categoryGroupName: Type.String({ description: 'Display name of the category group.' }),
    categoryGroupSlug: Type.String({ description: 'URL slug of the category group.' }),
    categoryGroupType: Type.String({
      description: 'Type of the category group, for example `vertical` or `horizontal`.',
    }),
  },
  {
    title: 'OssIndexCollectionCategory',
    description: 'The category named by `categorySlug`. Left out when `categorySlug` is not sent.',
  },
);

const Collections = Type.Object({
  ...paginated(OssIndexCollection, {
    data: 'Collections in the requested order. Empty when none match the filters.',
  }).properties,
  category: Type.Optional(OssIndexCollectionCategory),
});

const collectionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/oss-index/collections',
    {
      schema: {
        tags: ['OSS Index'],
        summary: 'List the OSS Index collections',
        description:
          'Returns collections with their totals and leading projects. `categorySlug` and `categoryGroupId` narrow the list, ' +
          'and `sort` orders it by contributors or by software value, then by `id`. With `categorySlug`, the response also includes that category. ' +
          'Pages follow position, as the Pagination guide describes.',
        querystring: Query,
        response: { 200: Collections },
      },
    },
    async (request) => {
      const { categorySlug, categoryGroupId, sort } = request.query;
      const page = requestedPage(request.query);

      let category: CategoryRow | undefined;
      if (categorySlug) {
        [category] = await fetchPipe<CategoryRow>(
          request,
          categoryPipePath,
          { slug: categorySlug },
          isCategoryRow,
        );
        if (!category) {
          throw new NotFoundError('Category not found');
        }
      }

      const rows = await fetchPipe<Row>(
        request,
        pipePath,
        {
          categorySlug: categorySlug || undefined,
          categoryGroupId: categoryGroupId || undefined,
          orderBy: sort ?? 'totalContributors',
          ...pipeWindow(page),
        },
        isRow,
      );

      // The pipe applies LIMIT and OFFSET after its final ORDER BY, so rows arrive in the order
      // toPage needs.
      const result = toPage(
        rows.map((row) => ({ ...row, topProjects: row.topProjects.map(toCollectionProject) })),
        page,
      );
      return category ? { ...result, category } : result;
    },
  );
};

export default collectionRoutes;
