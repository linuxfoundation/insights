// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrganizationKpis } from '~~/types/organization-page';
import { mockOrganizationKpis } from '~~/server/mocks/organization-page/kpis.mock';

export default defineEventHandler(async (): Promise<OrganizationKpis> => {
  // TODO: Replace with fetchFromTinybird when real data is available
  return mockOrganizationKpis.data;
});
