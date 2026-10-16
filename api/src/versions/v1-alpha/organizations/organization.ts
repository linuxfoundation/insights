// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { NotFoundError } from '../../../lib/errors.js';
import { findOrganizationProfile, OrganizationParams } from '../../../lib/organizations.js';
import { nullableString } from '../../../schemas/common.js';

const orNull = (value: string | null) => value || null;

const OrganizationProfile = Type.Object(
  {
    slug: Type.String({ description: 'Organization slug, as used in the request path.' }),
    name: Type.String({ description: "The organization's display name." }),
    logo: nullableString("URL of the organization's logo image. `null` when it has none."),
    description: nullableString('Short description of the organization. `null` when it has none.'),
    website: nullableString(
      "The organization's primary domain, as recorded for it. `null` when it has none.",
    ),
    domain: nullableString(
      'Host name taken from `website`. `null` when there is no website or no host can be read from it.',
    ),
    employeeCount: nullableString(
      'Size of the organization, as the label the organization page shows before "employees". `null` when it is unknown.',
    ),
    industries: Type.Array(Type.String(), {
      description: 'Industries the organization works in. Empty when none are known.',
    }),
    membership: nullableString(
      'Linux Foundation membership level of the organization, such as `Platinum` or `Gold`. `null` when it is not a member.',
    ),
  },
  { title: 'OrganizationProfile' },
);

const organizationRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/organizations/:slug',
    {
      schema: {
        tags: ['Organizations'],
        summary: 'Get an organization',
        description:
          'Returns the profile at the top of an organization page: name, logo, description, website, size, industries and Linux Foundation membership. ' +
          "Organization-level numbers come from the organization's other endpoints. " +
          'An unknown organization, or one whose affiliations are blocked, returns 404.',
        params: OrganizationParams,
        response: { 200: OrganizationProfile },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const row = await findOrganizationProfile(request, slug);
      if (!row) {
        throw new NotFoundError('Organization not found');
      }
      return {
        slug,
        name: row.displayName,
        logo: orNull(row.logo),
        description: orNull(row.description),
        website: orNull(row.website),
        domain: orNull(row.domain),
        // The organization page hides a size of 0, which marks an unknown size.
        employeeCount: row.employeeCount && row.employeeCount !== '0' ? row.employeeCount : null,
        industries: row.industry
          .split(',')
          .map((industry) => industry.trim())
          .filter(Boolean),
        membership: orNull(row.membership),
      };
    },
  );
};

export default organizationRoutes;
