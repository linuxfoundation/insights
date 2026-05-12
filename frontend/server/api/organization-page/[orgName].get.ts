// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrganizationProfile } from '~~/types/organization-page';
import { mockOrganizationProfile } from '~~/server/mocks/organization-page/profile.mock';

export default defineEventHandler(async (event): Promise<OrganizationProfile> => {
  const orgName = getRouterParam(event, 'orgName');

  // TODO: Replace with fetchFromTinybird when real data is available
  const org = mockOrganizationProfile.data.find((o) => o.name === orgName?.toLowerCase());

  if (!org) {
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
  }

  return org;
});
