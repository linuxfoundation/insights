// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { DateRangeQuery, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/packages.json';

interface Row {
  repo: string;
  name: string;
  ecosystem: string;
}

const isRow = (row: Row) =>
  typeof row.repo === 'string' && typeof row.name === 'string' && typeof row.ecosystem === 'string';

const compareCharCodes = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const compareRows = (a: Row, b: Row) =>
  compareCharCodes(a.ecosystem, b.ecosystem) ||
  compareCharCodes(a.name, b.name) ||
  compareCharCodes(a.repo, b.repo);

const Query = Type.Object({
  repos: DateRangeQuery.properties.repos,
  search: Type.Optional(
    Type.String({
      description:
        'Case-insensitive substring to match against the package name or the ecosystem. `%` and `_` act as wildcards.',
    }),
  ),
});

const Packages = Type.Object({
  data: Type.Array(
    Type.Object({
      name: Type.String({
        description: 'Package name. Pass it as `name` on the package metrics endpoint.',
      }),
      ecosystem: Type.String({
        description:
          'Package ecosystem, such as `npm` or `pypi`. Pass it as `ecosystem` on the package metrics endpoint.',
      }),
      repo: Type.String({ description: 'URL of the repository the package is published from.' }),
    }),
    {
      description:
        'One entry per package and repository, sorted by `ecosystem`, `name`, then `repo`. Empty for an unknown project.',
    },
  ),
});

const packagesRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/popularity/packages',
    {
      schema: {
        tags: ['Popularity'],
        summary: 'List packages',
        description:
          'Returns the packages published from the project repositories, with their ecosystem and repository. Pass a package `ecosystem` and `name` to the package metrics endpoint to read its downloads and dependents. `search` keeps the packages whose name or ecosystem contains it, ignoring case. A package published from several repositories appears once per repository. The whole list comes in one response, sorted by `ecosystem`, `name`, then `repo`, comparing character codes. An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: Packages },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, search } = request.query;

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<Row>(
          request,
          pipePath,
          { project: slug, bucketId, repos: repoFilter(repos), search: search || undefined },
          isRow,
        ),
      );
      if (!rows) {
        return { data: [] };
      }

      // The pipe returns its distinct rows in no set order.
      return { data: rows.sort(compareRows) };
    },
  );
};

export default packagesRoutes;
