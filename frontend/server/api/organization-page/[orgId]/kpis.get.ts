// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { OrganizationKpis } from '~~/types/organization-page';

export default defineEventHandler(async (event): Promise<OrganizationKpis> => {
  const orgId = getRouterParam(event, 'orgId');

  if (!orgId) {
    throw createError({ statusCode: 422, statusMessage: 'orgId is required' });
  }

  try {
    const res = await fetchFromTinybird<OrganizationKpis[]>('/v0/pipes/org_page_kpis.json', {
      orgId,
    });

    if (!res.data?.length) {
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
    }

    return res.data[0];
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
