// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import {
  isTopCollectionTuple,
  isTopProjectTuple,
  sortQuery,
  TopCollection,
  toTopCollection,
  TopProject,
  toTopProject,
  type TopCollectionTuple,
  type TopProjectTuple,
} from '../../../lib/oss-index.js';
import { isString } from '../../../lib/security.js';

const pipePath = '/v0/pipes/category_groups_oss_index.json';

interface Row {
  id: string;
  name: string;
  type: string;
  slug: string;
  totalContributors: number;
  softwareValue: number;
  avgScore: number;
  projectCount: number;
  topCollections: TopCollectionTuple[];
  topProjects: TopProjectTuple[];
}

const isNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);

const isRow = (row: Row) =>
  isString(row.id) &&
  isString(row.name) &&
  isString(row.type) &&
  isString(row.slug) &&
  isNumber(row.totalContributors) &&
  isNumber(row.softwareValue) &&
  isNumber(row.avgScore) &&
  isNumber(row.projectCount) &&
  Array.isArray(row.topCollections) &&
  row.topCollections.every(isTopCollectionTuple) &&
  Array.isArray(row.topProjects) &&
  row.topProjects.every(isTopProjectTuple);

const Query = Type.Object({
  type: Type.Optional(
    Type.String({
      description: 'Keeps the groups of this type, for example `vertical` or `horizontal`.',
    }),
  ),
  ...sortQuery.properties,
});

const OssIndexGroup = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the category group.' }),
    name: Type.String({ description: 'Display name of the category group.' }),
    type: Type.String({
      description: 'Type of the group, for example `vertical` or `horizontal`.',
    }),
    slug: Type.String({ description: 'URL slug of the category group.' }),
    totalContributors: Type.Number({ description: 'Contributors across the group.' }),
    softwareValue: Type.Number({ description: 'Software value of the group.' }),
    avgScore: Type.Number({ description: 'Average health score of the group, from 0 to 1.' }),
    projectCount: Type.Number({ description: 'Projects in the group.' }),
    topCollections: Type.Array(TopCollection, {
      description: 'Leading collections of the group, ordered by contributors.',
    }),
    topProjects: Type.Array(TopProject, {
      description: 'Leading projects of the group, ordered by contributors.',
    }),
  },
  { title: 'OssIndexGroup' },
);

const Groups = Type.Object({
  data: Type.Array(OssIndexGroup, {
    description: 'Category groups in the requested order. Empty when none match `type`.',
  }),
});

const groupRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/oss-index/groups',
    {
      schema: {
        tags: ['OSS Index'],
        summary: 'List the OSS Index category groups',
        description:
          'Returns every category group with its totals and its leading collections and projects. ' +
          '`type` keeps one group type, and `sort` orders the groups by contributors or by software value.',
        querystring: Query,
        response: { 200: Groups },
      },
    },
    async (request) => {
      const { type, sort } = request.query;
      const rows = await fetchPipe<Row>(
        request,
        pipePath,
        { type: type || undefined, orderBy: sort ?? 'totalContributors' },
        isRow,
      );
      return {
        data: rows.map((row) => ({
          ...row,
          topCollections: row.topCollections.map(toTopCollection),
          topProjects: row.topProjects.map(toTopProject),
        })),
      };
    },
  );
};

export default groupRoutes;
