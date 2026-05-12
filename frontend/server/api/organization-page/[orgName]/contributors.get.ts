// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrgContributor } from '~~/types/organization-page';
import { mockOrganizationContributors } from '~~/server/mocks/organization-page/contributors.mock';

export default defineEventHandler(async (): Promise<OrgContributor[]> => {
  // TODO: Replace with fetchFromTinybird when real data is available
  // TODO: Add authentication check - only org employees should see this data
  return mockOrganizationContributors.data;
});
