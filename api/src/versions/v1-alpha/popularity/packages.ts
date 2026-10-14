// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter } from '../../../clients/tinybird.js';
import { widgetRoutes } from '../../../lib/widget-scope.js';
import { DateRangeQuery } from '../../../schemas/common.js';

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

const CollectionQuery = Type.Object({
  search: Query.properties.search,
});

const Package = Type.Object({
  name: Type.String({
    description: 'Package name. Pass it as `name` on the package metrics endpoint.',
  }),
  ecosystem: Type.String({
    description:
      'Package ecosystem, such as `npm` or `pypi`. Pass it as `ecosystem` on the package metrics endpoint.',
  }),
  repo: Type.String({ description: 'URL of the repository the package is published from.' }),
});

const listing = 'One entry per package and repository, sorted by `ecosystem`, `name`, then `repo`.';

const Packages = Type.Object({
  data: Type.Array(Package, { description: `${listing} Empty for an unknown project.` }),
});

const CollectionPackages = Type.Object({
  data: Type.Array(Package, { description: listing }),
});

const lookup =
  'Pass a package `ecosystem` and `name` to the package metrics endpoint to read its downloads and dependents. `search` keeps the packages whose name or ecosystem contains it, ignoring case. A package published from several repositories appears once per repository. The whole list comes in one response, sorted by `ecosystem`, `name`, then `repo`, comparing character codes.';

const packagesRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  widgetRoutes(scope, {
    path: 'popularity/packages',
    tags: ['Popularity'],
    summary: 'List packages',
    project: {
      description:
        'Returns the packages published from the project repositories, with their ecosystem and repository. ' +
        lookup +
        ' An unknown project returns an empty `data` list.',
      querystring: Query,
      response: Packages,
    },
    collection: {
      description:
        "Returns the packages published from the collection's repositories, with their ecosystem and repository. " +
        lookup,
      querystring: CollectionQuery,
      response: CollectionPackages,
    },
    handler: async (request, withTarget) => {
      const { repos, search } = request.query;

      const rows = await withTarget((target) =>
        fetchPipe<Row>(
          request,
          pipePath,
          { ...target, repos: repoFilter(repos), search: search || undefined },
          isRow,
        ),
      );
      if (!rows) {
        return { data: [] };
      }

      // The pipe returns its distinct rows in no set order.
      return { data: rows.sort(compareRows) };
    },
  });
};

export default packagesRoutes;
