// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';

import { fetchPipe } from '../../clients/tinybird.js';
import { NotFoundError } from '../../lib/errors.js';
import { escapeLike } from '../../lib/leaderboards.js';
import { pipeWindow, requestedPage, toPage } from '../../lib/pagination.js';
import {
  nullableNumber,
  nullableString,
  paginated,
  PaginationQuery,
  ProjectSlugParams,
} from '../../schemas/common.js';

const pipePath = '/v0/pipes/projects_list.json';

interface ProjectRow {
  slug: string;
  name: string;
  sourceId?: string;
  description?: string;
  logo?: string;
  softwareValue?: number | string;
  keywords?: string[];
  maturity?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  repositories?: string[];
  archivedRepositories?: string[];
  excludedRepositories?: string[];
  // Tinybird may quote the numbers: 64-bit integers come as JSON strings.
  repoData?: [string, number | string, number | string][];
  repoLicenses?: [string, string][];
  connectedPlatforms?: string[];
}

const orNull = (value: string | undefined) => value || null;

// Mirrors getRepoNameFromUrl in frontend/server/helpers/repository.helpers.ts, matching on the host rather than the whole URL.
function repoName(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    if (hostname.includes('gerrit')) {
      if (pathname.includes('/c/')) return parts.slice(2, 4).join('/');
      if (pathname.includes('/q/project:')) {
        const last = parts.at(-1) as string;
        return last.includes('project:') ? (last.split(':').at(-1) as string) : last;
      }
    } else if (hostname === 'github.com') {
      return parts.slice(0, 2).join('/');
    }
  } catch {
    // A malformed URL names itself.
  }
  return url;
}

const Project = Type.Object({
  slug: Type.String({ description: 'Project slug, as used in the request path.' }),
  name: Type.String({ description: 'Display name of the project.' }),
  sourceId: nullableString('Identifier of the project in LFX. Null when it has none.'),
  description: nullableString('Short description of the project. Null when it has none.'),
  logoUrl: nullableString('URL of the project logo. Null when it has none.'),
  softwareValue: nullableNumber(
    'Estimated cost to rebuild the project software, in US dollars. Null when it has not been estimated.',
  ),
  tags: Type.Array(Type.String(), { description: 'Keywords that describe the project.' }),
  maturity: nullableString(
    'Maturity level the project foundation assigns, such as `Graduated` or `Incubating`. Null when it has none.',
  ),
  links: Type.Object(
    {
      website: nullableString('Project website URL. Null when it has none.'),
      linkedin: nullableString('LinkedIn page URL. Null when it has none.'),
      github: nullableString('GitHub organization or repository URL. Null when it has none.'),
      twitter: nullableString('X (Twitter) profile URL. Null when it has none.'),
    },
    { description: 'Links to the project elsewhere.' },
  ),
  repositories: Type.Array(
    Type.Object({
      url: Type.String({
        description: 'Repository URL. Pass it in `repos` on the Development endpoints.',
      }),
      name: Type.String({
        description:
          'Display name, as the Insights UI shows it: `owner/repo` for a GitHub repository, a shortened path for a Gerrit `/c/` or `/q/project:` URL, and the URL for any other.',
      }),
      score: nullableNumber(
        'Score of the repository among ranked open source repositories, from 0 to 1. Null when the repository is not ranked.',
      ),
      rank: nullableNumber(
        'Position of the repository by `score` across all ranked repositories, 1 being the highest. Null when the repository is not ranked.',
      ),
      licenses: Type.Array(Type.String(), {
        description: 'SPDX identifiers of the licenses found in the repository.',
      }),
      archived: Type.Boolean({ description: 'Whether the repository is archived.' }),
      excluded: Type.Boolean({
        description:
          'Whether the repository is excluded from the project health score and its metrics.',
      }),
    }),
    {
      description:
        'Repositories that belong to the project. Archived and excluded URLs that are not project repositories are left out.',
    },
  ),
  connectedPlatforms: Type.Array(Type.String(), {
    description:
      'Platforms the project has data from. Pass one in `platform` on the Development endpoints.',
  }),
});

const ProjectList = paginated(Project, {
  data: 'Up to `pageSize` projects, sorted by `name`. Empty when none match.',
});

const ProjectListQuery = Type.Object({
  search: Type.Optional(
    Type.String({
      maxLength: 200,
      description:
        'Case-insensitive text to find in the project name, matched literally. Empty means no filter.',
    }),
  ),
  ...PaginationQuery.properties,
});

function toProject(row: ProjectRow): Static<typeof Project> {
  // Tinybird keys Nango-synced platforms as `<platform>-nango`. The `platform` filter takes the
  // bare key, so strip the suffix as the UI does.
  const platforms = (row.connectedPlatforms ?? []).map((key) => key.replace(/-nango$/, ''));
  const repoData = new Map(
    (row.repoData ?? []).map(([url, score, rank]) => [url, { score, rank }]),
  );
  const licenses = new Map<string, string[]>();
  for (const [url, license] of row.repoLicenses ?? []) {
    licenses.set(url, [...(licenses.get(url) ?? []), license]);
  }
  const archived = new Set(row.archivedRepositories);
  const excluded = new Set(row.excludedRepositories);
  return {
    slug: row.slug,
    name: row.name,
    sourceId: orNull(row.sourceId),
    description: orNull(row.description),
    logoUrl: orNull(row.logo),
    // The Overview tab hides a zero value, which marks a project that has not been estimated.
    softwareValue: Number(row.softwareValue) || null,
    tags: row.keywords ?? [],
    maturity: orNull(row.maturity),
    links: {
      website: orNull(row.website),
      linkedin: orNull(row.linkedin),
      github: orNull(row.github),
      twitter: orNull(row.twitter),
    },
    repositories: (row.repositories ?? []).map((url) => {
      const data = repoData.get(url);
      // Rank 0 marks a repository outside the ranking, as does a missing entry.
      const ranked = data !== undefined && Number(data.rank) > 0;
      return {
        url,
        name: repoName(url),
        score: ranked ? Number(data.score) : null,
        rank: ranked ? Number(data.rank) : null,
        licenses: licenses.get(url) ?? [],
        archived: archived.has(url),
        excluded: excluded.has(url),
      };
    }),
    connectedPlatforms: [...new Set(platforms)],
  };
}

const projectRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects',
    {
      schema: {
        tags: ['Projects'],
        summary: 'List projects',
        description:
          'Returns the projects in Insights, one page at a time, with the fields `GET /v1-alpha/projects/{slug}` returns. ' +
          '`sourceId` is the identifier of each project in LFX. ' +
          '`search` keeps the projects whose name contains it, ignoring case. ' +
          'Projects are sorted by `name`, and those with the same name by an internal ID, so they keep their order from one page to the next. ' +
          'Pages follow position, as the Pagination guide describes, and a cursor keeps its position when `pageSize` changes.',
        querystring: ProjectListQuery,
        response: { 200: ProjectList },
      },
    },
    async (request) => {
      const page = requestedPage(request.query);
      const rows = await fetchPipe<ProjectRow>(request, pipePath, {
        search: request.query.search ? escapeLike(request.query.search) : undefined,
        orderByField: 'name',
        orderByDirection: 'asc',
        ...pipeWindow(page),
      });
      // The pipe applies LIMIT and OFFSET after its only ORDER BY, so rows arrive in the order
      // toPage needs.
      return toPage(rows.map(toProject), page);
    },
  );

  scope.get(
    '/projects/:slug',
    {
      schema: {
        tags: ['Projects'],
        summary: 'Get a project',
        description:
          'Returns the project name, its repositories and its connected platforms, plus the About section of the Overview tab: description, logo, software value, tags, maturity and links. Use the repository URLs and platforms as the `repos` and `platform` values on the Development endpoints.',
        params: ProjectSlugParams,
        response: { 200: Project },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const [row] = await fetchPipe<ProjectRow>(request, pipePath, { slug, details: true });
      if (!row) {
        throw new NotFoundError('Project not found');
      }
      return toProject(row);
    },
  );
};

export default projectRoutes;
