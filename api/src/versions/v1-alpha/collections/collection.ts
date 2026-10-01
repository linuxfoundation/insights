// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { findCollectionDetail } from '../../../lib/collections-db.js';
import { Collection, toCollection } from '../../../lib/collections.js';
import { NotFoundError } from '../../../lib/errors.js';

const CollectionParams = Type.Object({
  slug: Type.String({ minLength: 1, description: 'Slug of the collection.' }),
});

const CollectionDetail = Type.Composite(
  [
    Collection,
    Type.Object({
      projectIds: Type.Array(Type.String({ format: 'uuid' }), {
        description: 'Identifiers of the projects in the collection.',
      }),
      repositoryUrls: Type.Array(Type.String(), {
        description: 'URLs of the repositories added to the collection on their own.',
      }),
    }),
  ],
  { title: 'CollectionDetail' },
);

const collectionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/collections/:slug',
    {
      schema: {
        tags: ['Collections'],
        summary: 'Get a collection',
        description:
          'Returns one collection with the projects and repositories it holds. Collection-level numbers come from the metrics endpoints of the collection.',
        params: CollectionParams,
        response: { 200: CollectionDetail },
      },
    },
    async (request) => {
      const row = await findCollectionDetail(request, request.params.slug);
      if (!row) {
        throw new NotFoundError('Collection not found');
      }
      return {
        ...toCollection(row),
        projectIds: row.projectIds,
        repositoryUrls: row.repositoryUrls,
      };
    },
  );
};

export default collectionRoutes;
