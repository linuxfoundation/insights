// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { type Static, Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import { NotFoundError } from '../../../lib/errors.js';
import { findOrganizationProfile, OrganizationParams } from '../../../lib/organizations.js';
import { pipeWindow, requestedPage, toPage } from '../../../lib/pagination.js';
import { dataEnum, isCount, isString } from '../../../lib/security.js';
import { nullableString, paginated, PaginationQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/org_page_projects.json';

interface ProjectRow {
  projectSlug: string;
  projectName: string;
  projectLogo: string;
  activityCount: number;
  contributorCount: number;
  technicalScore: number;
}

const isProjectRow = (row: ProjectRow) =>
  isString(row.projectSlug) &&
  row.projectSlug !== '' &&
  isString(row.projectName) &&
  isString(row.projectLogo) &&
  isCount(row.activityCount) &&
  isCount(row.contributorCount) &&
  Number.isFinite(row.technicalScore) &&
  row.technicalScore >= 0;

const TechnicalInfluence = dataEnum(
  ['leading', 'contributing', 'participating', 'silent'],
  'Band of `technicalScore` the organization page shows as technical influence: `leading` from 15, `contributing` from 5, `participating` from 1 and `silent` below 1.',
);

// The bands of computeInfluence in the organization page's projects section.
function technicalInfluence(score: number): Static<typeof TechnicalInfluence> {
  if (score >= 15) return 'leading';
  if (score >= 5) return 'contributing';
  if (score >= 1) return 'participating';
  return 'silent';
}

const OrganizationProject = Type.Object(
  {
    slug: Type.String({
      description: 'Project slug. Pass it to `GET /v1-alpha/projects/{slug}` for the project.',
    }),
    name: Type.String({ description: 'Display name of the project.' }),
    logoUrl: nullableString('URL of the project logo. `null` when it has none.'),
    contributionCount: Type.Integer({
      minimum: 0,
      description:
        "Code contributions (commits, pull requests and code reviews) by the organization's contributors to the project in the last 730 days (count).",
    }),
    contributorCount: Type.Integer({
      minimum: 0,
      description:
        "The organization's contributors with code contributions to the project in the last 730 days (count).",
    }),
    technicalScore: Type.Number({
      minimum: 0,
      description:
        "Technical influence score of the organization on the project over the last 730 days: 10 points when one of its contributors is an active maintainer, plus points for its shares of the project's contributors, commits and opened pull requests. Higher means more influence; it is not capped at 100.",
    }),
    technicalInfluence: TechnicalInfluence,
  },
  { title: 'OrganizationProject' },
);

const OrganizationProjects = paginated(OrganizationProject, {
  data: 'Up to `pageSize` projects, by `contributorCount`, then `technicalScore`, then `contributionCount`, all descending. Empty when the organization has no code contributions in the last 730 days.',
});

const projectsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/organizations/:slug/projects',
    {
      schema: {
        tags: ['Organizations'],
        summary: 'List the projects of an organization',
        description:
          "Returns the projects the organization's contributors made code contributions to in the last 730 days, as the organization page lists them, one page at a time. " +
          'The figures are recomputed once a day. Pages follow position, as the Pagination guide describes. ' +
          'An unknown organization, or one whose affiliations are blocked, returns 404.',
        params: OrganizationParams,
        querystring: PaginationQuery,
        response: { 200: OrganizationProjects },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const page = requestedPage(request.query);
      const rows = await fetchPipe<ProjectRow>(
        request,
        pipePath,
        { orgSlug: slug, ...pipeWindow(page) },
        isProjectRow,
      );
      // An empty page is also what an unknown organization gets, which the profile tells apart.
      if (rows.length === 0 && !(await findOrganizationProfile(request, slug))) {
        throw new NotFoundError('Organization not found');
      }
      // The pipe applies LIMIT and OFFSET after its only ORDER BY, so rows arrive in the order
      // toPage needs.
      return toPage(
        rows.map((row) => ({
          slug: row.projectSlug,
          name: row.projectName,
          logoUrl: row.projectLogo || null,
          contributionCount: row.activityCount,
          contributorCount: row.contributorCount,
          technicalScore: row.technicalScore,
          technicalInfluence: technicalInfluence(row.technicalScore),
        })),
        page,
      );
    },
  );
};

export default projectsRoutes;
