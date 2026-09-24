// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { breakdown } from '../../../lib/security.js';
import { nullableString, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/vulnerabilities_by_ecosystem.json';

const { isRow, toItem, Item } = breakdown(
  'ecosystem',
  'packageEcosystem',
  nullableString(
    'Package ecosystem, such as `npm` or `PyPI`. `null` groups packages without an ecosystem.',
  ),
);

// Compares character codes so the tie order is the same on every host, where localeCompare
// follows the host locale.
const compareCharCodes = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const Query = Type.Object({
  repos: Type.Optional(
    Type.Array(Type.String(), {
      description:
        'Repository URLs to filter by. Each must match a repository URL exactly, as the project lists it.',
    }),
  ),
});

const ByEcosystem = Type.Object({
  data: Type.Array(Item, {
    description:
      'One entry per ecosystem with unresolved vulnerabilities, by `count` from most to fewest, then by ecosystem name. An unknown project gets an empty list.',
  }),
});

const vulnerabilitiesByEcosystemRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/security/vulnerabilities/by-ecosystem',
    {
      schema: {
        tags: ['Security'],
        summary: 'Break vulnerabilities down by ecosystem',
        description:
          'Returns the unresolved vulnerabilities of the project repositories per package ecosystem, with the share of the total for each ecosystem. ' +
          'A vulnerability counts once per package and manifest file, so counts can exceed the entries of the vulnerability list. ' +
          '`RESOLVED` vulnerabilities and archived repositories are left out.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: ByEcosystem },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe(
          request,
          pipePath,
          { project: slug, bucketId, repos: repoFilter(request.query.repos) },
          isRow,
        ),
      );
      const data = (rows ?? [])
        .map(toItem)
        .sort(
          (a, b) => b.count - a.count || compareCharCodes(a.ecosystem ?? '', b.ecosystem ?? ''),
        );
      return { data };
    },
  );
};

export default vulnerabilitiesByEcosystemRoutes;
