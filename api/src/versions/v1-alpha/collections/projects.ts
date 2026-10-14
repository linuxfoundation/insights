// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { postCountedPipe } from '../../../clients/tinybird.js';
import { findCollectionMembers } from '../../../lib/collections-db.js';
import {
  CollectionProject,
  CollectionProjectType,
  isCollectionProjectRow,
  toCollectionProject,
  type CollectionProjectRow,
} from '../../../lib/collections.js';
import { NotFoundError } from '../../../lib/errors.js';
import { pipePages, requestedPage, toCountedPage } from '../../../lib/pagination.js';
import { dataEnum } from '../../../lib/security.js';
import { paginated, PaginationQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/project_repo_insights.json';

const sortFields = ['contributorCount', 'organizationCount', 'name'] as const;
const sortValues = sortFields.flatMap((field) => [`${field}_asc`, `${field}_desc`] as const);

const Params = Type.Object({
  slug: Type.String({ description: 'Collection slug, as `slug` in `GET /v1-alpha/collections`.' }),
});

const Query = Type.Object({
  sort: Type.Optional(
    dataEnum(
      sortValues,
      'Sort field and direction, `<field>_<asc|desc>`. Defaults to `contributorCount_desc`.',
    ),
  ),
  isLF: Type.Optional(
    Type.Boolean({
      description:
        'Keeps only Linux Foundation projects (`true`) or only the others (`false`). Omit it for both.',
    }),
  ),
  type: Type.Optional(CollectionProjectType),
  ...PaginationQuery.properties,
});

const CollectionProjects = paginated(CollectionProject, {
  data: 'Up to `pageSize` projects and repositories, in the requested sort order. Empty when none match.',
});

const collectionProjectsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/collections/:slug/projects',
    {
      schema: {
        tags: ['Collections'],
        summary: 'List the projects and repositories of a collection',
        description:
          'Returns the projects of a public collection and the repositories added to it on their own, with their Insights metrics, one page at a time. ' +
          '`type` keeps only `project` or only `repo` entries, and `isLF` keeps Linux Foundation or other projects. ' +
          'A `repo` entry carries the name, slug and logo of the project that holds it, and `repoUrl` tells such entries apart. ' +
          'Pages follow position, as the Pagination guide describes, and a cursor keeps its position when `pageSize` changes. ' +
          'Answers 404 for an unknown or private collection.',
        params: Params,
        querystring: Query,
        response: { 200: CollectionProjects },
      },
    },
    async (request) => {
      const { isLF, type, sort = 'contributorCount_desc' } = request.query;
      const page = requestedPage(request.query);

      const members = await findCollectionMembers(request, request.params.slug);
      if (!members) {
        throw new NotFoundError('Collection not found');
      }

      // The pipe returns project rows for `ids` and repository rows for `repoUrls`, so leaving one
      // list out filters by type before paging.
      const ids = type === 'repo' ? [] : members.projectIds;
      const repoUrls = type === 'project' ? [] : members.repositoryUrls;
      if (ids.length === 0 && repoUrls.length === 0) {
        return toCountedPage([], page, 0);
      }

      const split = sort.lastIndexOf('_');
      const { pages, skip } = pipePages(page);
      const chunks = await Promise.all(
        pages.map((number) =>
          postCountedPipe<CollectionProjectRow>(
            request,
            pipePath,
            {
              ids: ids.length > 0 ? ids : undefined,
              repoUrls: repoUrls.length > 0 ? repoUrls : undefined,
              orderByField: sort.slice(0, split),
              orderByDirection: sort.slice(split + 1),
              isLfx: isLF === undefined ? undefined : Number(isLF),
              page: number,
              pageSize: page.pageSize,
            },
            isCollectionProjectRow,
          ),
        ),
      );
      const fetched = chunks.flatMap((chunk) => chunk.rows);
      const rows = fetched.slice(skip, skip + page.pageSize);
      // A total below the rows already seen contradicts the page, so it is treated as missing. Then a
      // full last pipe page is the only sign that more rows follow.
      const last = chunks[chunks.length - 1]!;
      const seen = pages[0]! * page.pageSize + fetched.length;
      const reported = chunks[0]!.total;
      const total =
        reported !== undefined && reported >= seen
          ? reported
          : seen + (last.rows.length === page.pageSize ? 1 : 0);

      return toCountedPage(rows.map(toCollectionProject), page, total);
    },
  );
};

export default collectionProjectsRoutes;
