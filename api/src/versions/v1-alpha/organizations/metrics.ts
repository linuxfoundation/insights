// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe } from '../../../clients/tinybird.js';
import { NotFoundError } from '../../../lib/errors.js';
import { findOrganizationProfile, OrganizationParams } from '../../../lib/organizations.js';
import { isCount } from '../../../lib/security.js';

const pipePath = '/v0/pipes/org_page_kpis.json';

interface KpisRow {
  activeContributors: number;
  activeContributorsTrend: number;
  activeContributorsTrendAbsolute: number;
  activeContributorsTrendPrevious: number;
  maintainerRoles: number;
  criticalProjects: number;
}

const isKpisRow = (row: KpisRow) =>
  isCount(row.activeContributors) &&
  isCount(row.activeContributorsTrendPrevious) &&
  row.activeContributorsTrendAbsolute ===
    row.activeContributors - row.activeContributorsTrendPrevious &&
  Number.isFinite(row.activeContributorsTrend) &&
  isCount(row.maintainerRoles) &&
  isCount(row.criticalProjects);

const count = (description: string) => Type.Integer({ minimum: 0, description });

const OrganizationMetrics = Type.Object(
  {
    activeContributorCount: count(
      'People with code contributions (commits, pull requests and code reviews) attributed to the organization in the last 730 days (count).',
    ),
    previousActiveContributorCount: count(
      'The same count for the 730 days before those, from 1460 to 731 days ago.',
    ),
    activeContributorChange: Type.Integer({
      description:
        '`activeContributorCount` minus `previousActiveContributorCount`. Negative when fewer people contributed in the last 730 days.',
    }),
    activeContributorChangePercent: Type.Number({
      description:
        '`activeContributorChange` as a percentage of `previousActiveContributorCount`, rounded to one decimal. 0 when `previousActiveContributorCount` is 0.',
    }),
    maintainerRoleCount: count(
      "Maintainer roles the organization's contributors held at any point in the last 730 days, one per person and project (count).",
    ),
    criticalProjectCount: count(
      "Projects the organization's contributors made code contributions to in the last 730 days (count). The organization page labels them critical projects.",
    ),
  },
  { title: 'OrganizationMetrics' },
);

const zeros = {
  activeContributorCount: 0,
  previousActiveContributorCount: 0,
  activeContributorChange: 0,
  activeContributorChangePercent: 0,
  maintainerRoleCount: 0,
  criticalProjectCount: 0,
};

const metricsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/organizations/:slug/metrics',
    {
      schema: {
        tags: ['Organizations'],
        summary: 'Get organization metrics',
        description:
          "Returns the figures in the organization page's KPI row: active contributors with their change against the previous period, maintainer roles held and projects contributed to, all over the last 730 days. " +
          'The figures are recomputed once a day. ' +
          'An organization without code contributions or maintainer roles in the windows gets zeros. ' +
          'An unknown organization, or one whose affiliations are blocked, returns 404.',
        params: OrganizationParams,
        response: { 200: OrganizationMetrics },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const [row] = await fetchPipe<KpisRow>(request, pipePath, { orgSlug: slug }, isKpisRow);
      if (row) {
        return {
          activeContributorCount: row.activeContributors,
          previousActiveContributorCount: row.activeContributorsTrendPrevious,
          activeContributorChange: row.activeContributorsTrendAbsolute,
          activeContributorChangePercent: row.activeContributorsTrend,
          maintainerRoleCount: row.maintainerRoles,
          criticalProjectCount: row.criticalProjects,
        };
      }
      // The KPI copy has no row for an organization without activity in the windows, which the
      // profile tells apart from an unknown organization.
      if (!(await findOrganizationProfile(request, slug))) {
        throw new NotFoundError('Organization not found');
      }
      return zeros;
    },
  );
};

export default metricsRoutes;
