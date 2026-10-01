// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { listRepositoryCollections } from '../../../lib/collections-db.js';
import { CollectionMemberships, toCollectionRef } from '../../../lib/collections.js';
import { NotFoundError } from '../../../lib/errors.js';

const RepositoryCollectionsQuery = Type.Object({
  url: Type.String({
    minLength: 1,
    description:
      'URL of the repository, as listed in the `repositories` of `GET /v1-alpha/projects/{slug}`, for example `https://github.com/kubernetes/kubernetes`. It must match exactly.',
  }),
});

const repositoryCollectionRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/repositories/collections',
    {
      schema: {
        tags: ['Collections'],
        summary: 'List collections of a repository',
        description:
          'Returns the public collections that contain the repository, with `publicCount` as their number. A collection contains the repository when the repository was added to it directly; a collection that holds only its project does not count. The whole list comes in one response, sorted by `name`, then `slug`. A repository in no public collection returns an empty `data` list and a `publicCount` of 0. An unknown repository returns 404. The URL goes in the query because it does not fit in a path segment.',
        querystring: RepositoryCollectionsQuery,
        response: { 200: CollectionMemberships },
      },
    },
    async (request) => {
      const rows = await listRepositoryCollections(request, request.query.url);
      if (!rows) {
        throw new NotFoundError('Repository not found');
      }
      return { data: rows.map(toCollectionRef), publicCount: rows.length };
    },
  );
};

export default repositoryCollectionRoutes;
