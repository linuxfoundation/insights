// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { OrgDashContributors } from '~~/types/organization-dashboard';

export default defineEventHandler(async (event): Promise<OrgDashContributors[]> => {
  const query = getQuery(event);
  const project: string = query?.project as string;

  if (!project) {
    throw createError({ statusCode: 422, statusMessage: 'Project is required' });
  }

  const organizationIds: string[] = ((query?.organizationIds as string) || '').split(',');
  if (!organizationIds) {
    throw createError({ statusCode: 422, statusMessage: 'Organization IDs are required' });
  }

  const startDate = query.startDate ? DateTime.fromISO(query.startDate as string) : undefined;
  const endDate = query.endDate ? DateTime.fromISO(query.endDate as string) : undefined;
  const granularity: string = (query.granularity as string) || 'monthly';

  try {
    const res = await fetchFromTinybird<OrgDashContributors[]>(
      '/v0/pipes/org_dash_contributors.json',
      {
        project,
        organizationIds,
        startDate,
        endDate,
        granularity,
      },
    );

    return res.data;
  } catch (error) {
    console.error('Error fetching organization dashboard contributors from TinyBird:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
