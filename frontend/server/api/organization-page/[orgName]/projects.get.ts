// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrganizationProject } from '~~/types/organization-page';
import { mockOrganizationProjects } from '~~/server/mocks/organization-page/projects.mock';

export default defineEventHandler(async (): Promise<OrganizationProject[]> => {
  // TODO: Replace with fetchFromTinybird when real data is available
  return mockOrganizationProjects.data;
});
