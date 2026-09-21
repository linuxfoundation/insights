// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { fetchPipe } from '../../clients/tinybird.js';
import { NotFoundError } from '../../lib/errors.js';
import { ProjectSlugParams } from '../../schemas/common.js';

interface ProjectRow {
  slug: string;
  name: string;
  repositories?: string[];
  connectedPlatforms?: string[];
}

const Project = Type.Object({
  slug: Type.String({ description: 'Project slug, as used in the request path.' }),
  name: Type.String({ description: 'Display name of the project.' }),
  repositories: Type.Array(
    Type.Object({
      url: Type.String({
        description: 'Repository URL. Pass it in `repos` on the Development endpoints.',
      }),
    }),
    { description: 'Repositories that belong to the project.' },
  ),
  connectedPlatforms: Type.Array(Type.String(), {
    description:
      'Platforms the project has data from. Pass one in `platform` on the Development endpoints.',
  }),
});

const projectRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug',
    {
      schema: {
        tags: ['Projects'],
        summary: 'Get a project',
        description:
          'Returns the project name, its repository URLs and its connected platforms. Use them as the `repos` and `platform` values on the Development endpoints.',
        params: ProjectSlugParams,
        response: { 200: Project },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const [row] = await fetchPipe<ProjectRow>(request, '/v0/pipes/projects_list.json', {
        slug,
        details: true,
      });
      if (!row) {
        throw new NotFoundError('Project not found');
      }

      // Tinybird keys Nango-synced platforms as `<platform>-nango`. The `platform` filter takes the
      // bare key, so strip the suffix as the UI does.
      const platforms = (row.connectedPlatforms ?? []).map((key) => key.replace(/-nango$/, ''));
      return {
        slug: row.slug,
        name: row.name,
        repositories: (row.repositories ?? []).map((url) => ({ url })),
        connectedPlatforms: [...new Set(platforms)],
      };
    },
  );
};

export default projectRoutes;
