// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, withBucket } from '../../clients/tinybird.js';
import { ProjectSlugParams } from '../../schemas/common.js';

const pipePath = '/v0/pipes/repository_groups_list.json';

interface Row {
  name: string;
  slug: string;
  repositories: string[];
}

const isRow = (row: Row) =>
  typeof row.name === 'string' &&
  typeof row.slug === 'string' &&
  Array.isArray(row.repositories) &&
  row.repositories.every((url) => typeof url === 'string');

// Compares character codes so the order is the same on every host, where localeCompare follows
// the host locale.
const compareCharCodes = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const compareRows = (a: Row, b: Row) =>
  compareCharCodes(a.name, b.name) || compareCharCodes(a.slug, b.slug);

const RepositoryGroups = Type.Object({
  data: Type.Array(
    Type.Object({
      name: Type.String({ description: 'Display name of the repository group.' }),
      slug: Type.String({ description: 'Identifier of the repository group within the project.' }),
      repositories: Type.Array(Type.String(), {
        description:
          'URLs of the repositories in the group. Pass them in `repos` on the other project endpoints to read the group alone.',
      }),
    }),
    {
      description:
        'One entry per repository group, sorted by `name`, then `slug`. Empty for an unknown project or a project without groups.',
    },
  ),
});

const repositoryGroupRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/repository-groups',
    {
      schema: {
        tags: ['Projects'],
        summary: 'List repository groups',
        description:
          'Returns the repository groups of the project, such as the SIGs of Kubernetes, with the repository URLs in each. Pass the URLs of a group in `repos` on the other project endpoints to read that group alone. Deleted groups are left out. The whole list comes in one response, sorted by `name`, then `slug`, comparing character codes. An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        response: { 200: RepositoryGroups },
      },
    },
    async (request) => {
      const { slug } = request.params;

      // The pipe reads `project` only; the bucket lookup still answers an unknown slug with empty data.
      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<Row>(request, pipePath, { project: slug, bucketId }, isRow),
      );
      if (!rows) {
        return { data: [] };
      }

      // The pipe applies no ORDER BY.
      return { data: rows.sort(compareRows) };
    },
  );
};

export default repositoryGroupRoutes;
