// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { listProjectCollections } from '../../../lib/collections-db.js';
import { CollectionMemberships, toCollectionRef } from '../../../lib/collections.js';
import { ProjectSlugParams } from '../../../schemas/common.js';

const projectCollectionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/collections',
    {
      schema: {
        tags: ['Collections'],
        summary: 'List collections of a project',
        description:
          'Returns the public collections that contain the project, with `publicCount` as their number. A collection contains the project when the project was added to it directly. The whole list comes in one response, sorted by `name`, then `slug`. An unknown project returns an empty `data` list and a `publicCount` of 0.',
        params: ProjectSlugParams,
        response: { 200: CollectionMemberships },
      },
    },
    async (request) => {
      const rows = await listProjectCollections(request, request.params.slug);
      return { data: rows.map(toCollectionRef), publicCount: rows.length };
    },
  );
};

export default projectCollectionRoutes;
