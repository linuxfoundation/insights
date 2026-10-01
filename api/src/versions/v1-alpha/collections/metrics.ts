// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import { findCollection } from '../../../lib/collections-db.js';
import { NotFoundError } from '../../../lib/errors.js';
import { inRange, isCount } from '../../../lib/security.js';
import { nullableNumber, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/collection_insights_aggregate.json';

interface AggregateRow {
  uniqueContributorCount: number;
  avgHealthScore: number | null;
}

const isAggregateRow = (row: AggregateRow) =>
  isCount(row.uniqueContributorCount) &&
  (row.avgHealthScore === null || inRange(row.avgHealthScore, 100));

const CollectionMetrics = Type.Object(
  {
    projectAndRepositoryCount: Type.Integer({
      minimum: 0,
      description:
        'Projects plus repositories added on their own in the collection (count), as the collection page lists them.',
    }),
    uniqueContributorCount: nullableNumber(
      'Contributors across the collection, each counted once (count). `null` when no data is available.',
    ),
    avgHealthScore: nullableNumber(
      'Average health score of the collection projects, from 0 to 100. `null` when no data is available or no project has a score.',
    ),
  },
  { title: 'CollectionMetrics' },
);

const metricsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/collections/:slug/metrics',
    {
      schema: {
        tags: ['Collections'],
        summary: 'Get collection metrics',
        description:
          'Returns the figures at the top of a collection page: how many projects and repositories it holds, how many unique contributors work across them and their average health score. ' +
          'Private collections are not available and behave as unknown. ' +
          '`uniqueContributorCount` and `avgHealthScore` are `null` when the analytics data has nothing for the collection, and `avgHealthScore` is also `null` when no project has a score. ' +
          'An unknown or private collection returns 404.',
        params: ProjectSlugParams,
        response: { 200: CollectionMetrics },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const collection = await findCollection(request, slug);
      if (!collection) {
        throw new NotFoundError('Collection not found');
      }

      const [row] = await fetchPipe<AggregateRow>(
        request,
        pipePath,
        { collectionSlug: slug },
        isAggregateRow,
      );
      return {
        projectAndRepositoryCount: collection.projectCount + collection.repositoryCount,
        uniqueContributorCount: row?.uniqueContributorCount ?? null,
        avgHealthScore: row?.avgHealthScore ?? null,
      };
    },
  );
};

export default metricsRoutes;
