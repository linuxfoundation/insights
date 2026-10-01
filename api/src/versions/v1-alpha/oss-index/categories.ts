// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import { NotFoundError } from '../../../lib/errors.js';
import {
  CategoryTopProject,
  isCategoryTopProjectTuple,
  isTopCollectionTuple,
  sortQuery,
  TopCollection,
  toCategoryTopProject,
  toTopCollection,
  type CategoryTopProjectTuple,
  type TopCollectionTuple,
} from '../../../lib/oss-index.js';
import { isString } from '../../../lib/security.js';

const groupPipePath = '/v0/pipes/category_groups_list.json';
const categoriesPipePath = '/v0/pipes/categories_oss_index.json';

interface GroupRow {
  name: string;
  slug: string;
  type: string;
}

interface Row {
  id: string;
  name: string;
  slug: string;
  totalContributors: number;
  softwareValue: number;
  avgScore: number;
  topCollections: TopCollectionTuple[];
  topProjects: CategoryTopProjectTuple[];
}

const isNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);

const isGroupRow = (row: GroupRow) =>
  isString(row.name) && isString(row.slug) && isString(row.type);

const isRow = (row: Row) =>
  isString(row.id) &&
  isString(row.name) &&
  isString(row.slug) &&
  isNumber(row.totalContributors) &&
  isNumber(row.softwareValue) &&
  isNumber(row.avgScore) &&
  Array.isArray(row.topCollections) &&
  row.topCollections.every(isTopCollectionTuple) &&
  Array.isArray(row.topProjects) &&
  row.topProjects.every(isCategoryTopProjectTuple);

const Query = Type.Object({
  categoryGroupSlug: Type.String({
    minLength: 1,
    description: 'Slug of the category group, for example `runtime-horizontal`.',
  }),
  ...sortQuery.properties,
});

const OssIndexCategory = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the category.' }),
    name: Type.String({ description: 'Display name of the category.' }),
    slug: Type.String({ description: 'URL slug of the category.' }),
    totalContributors: Type.Number({ description: 'Contributors across the category.' }),
    softwareValue: Type.Number({ description: 'Software value of the category.' }),
    avgScore: Type.Number({ description: 'Average health score of the category, from 0 to 1.' }),
    topCollections: Type.Array(TopCollection, {
      description: 'Leading collections of the category, ordered by contributors.',
    }),
    topProjects: Type.Array(CategoryTopProject, {
      description: 'Leading projects of the category, ordered by contributors.',
    }),
  },
  { title: 'OssIndexCategory' },
);

const OssIndexCategories = Type.Object(
  {
    name: Type.String({ description: 'Display name of the category group.' }),
    slug: Type.String({ description: 'URL slug of the category group.' }),
    type: Type.String({
      description: 'Type of the group, for example `vertical` or `horizontal`.',
    }),
    categories: Type.Array(OssIndexCategory, {
      description: 'Categories of the group in the requested order. Empty when it has none.',
    }),
  },
  { title: 'OssIndexCategories' },
);

const categoryRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/oss-index/categories',
    {
      schema: {
        tags: ['OSS Index'],
        summary: 'List the categories of an OSS Index category group',
        description:
          'Returns a category group with each of its categories, their totals and their leading collections and projects. ' +
          '`sort` orders the categories by contributors or by software value. ' +
          'Answers 404 when no group has the given slug.',
        querystring: Query,
        response: { 200: OssIndexCategories },
      },
    },
    async (request) => {
      const { categoryGroupSlug, sort } = request.query;
      const [group] = await fetchPipe<GroupRow>(
        request,
        groupPipePath,
        { slug: categoryGroupSlug },
        isGroupRow,
      );
      if (!group) {
        throw new NotFoundError('Category group not found');
      }

      const rows = await fetchPipe<Row>(
        request,
        categoriesPipePath,
        { categoryGroupSlug, orderBy: sort ?? 'totalContributors' },
        isRow,
      );
      return {
        name: group.name,
        slug: group.slug,
        type: group.type,
        categories: rows.map((row) => ({
          ...row,
          topCollections: row.topCollections.map(toTopCollection),
          topProjects: row.topProjects.map(toCategoryTopProject),
        })),
      };
    },
  );
};

export default categoryRoutes;
