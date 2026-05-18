// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { OrganizationProject } from '~~/types/organization-page';

export default defineEventHandler(async (event): Promise<OrganizationProject[]> => {
  const orgId = getRouterParam(event, 'orgId');

  if (!orgId) {
    throw createError({ statusCode: 422, statusMessage: 'orgId is required' });
  }

  try {
    const res = await fetchFromTinybird<OrganizationProject[]>('/v0/pipes/org_page_projects.json', {
      orgId,
    });

    return res.data ?? [];
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
