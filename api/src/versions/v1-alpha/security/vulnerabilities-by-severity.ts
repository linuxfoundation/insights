// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { breakdown, Severity } from '../../../lib/security.js';
import { ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/vulnerabilities_by_severity.json';

const { isRow, toItem, Item } = breakdown('severity', 'severity', Severity);

// The pipe orders by count alone, so ties fall back to the enum order, most severe first.
const rank = (severity: string) => Severity.enum.indexOf(severity);

const Query = Type.Object({
  repos: Type.Optional(
    Type.Array(Type.String(), {
      description:
        'Repository URLs to filter by. Each must match a repository URL exactly, as the project lists it.',
    }),
  ),
});

const BySeverity = Type.Object({
  data: Type.Array(Item, {
    description:
      'One entry per severity with unresolved vulnerabilities, by `count` from most to fewest, then from the most severe down. An unknown project gets an empty list.',
  }),
});

const vulnerabilitiesBySeverityRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/security/vulnerabilities/by-severity',
    {
      schema: {
        tags: ['Security'],
        summary: 'Break vulnerabilities down by severity',
        description:
          'Returns the unresolved vulnerabilities of the project repositories per severity, with the share of the total for each severity. ' +
          'A vulnerability counts once per package and manifest file, so counts can exceed the entries of the vulnerability list. ' +
          '`RESOLVED` vulnerabilities and archived repositories are left out.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: BySeverity },
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
        .sort((a, b) => b.count - a.count || rank(a.severity) - rank(b.severity));
      return { data };
    },
  );
};

export default vulnerabilitiesBySeverityRoutes;
