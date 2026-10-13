// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';

import { formatNumberShort } from '~/components/shared/utils/formatter';
import type { TinybirdActiveContributorsSummary } from '~~/server/data/tinybird/responses.types';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { logError } from '~~/server/utils/log';

export default defineEventHandler(async (event): Promise<void> => {
  const query = getQuery(event);
  const project: string = query?.project as string;
  const repos: string[] = (query?.repos as string)?.split(',') || undefined;

  try {
    // Same pipe, filters and 365-day window as the share preview of this badge (active-contributor-badge.vue).
    const now = DateTime.utc();
    const res = await fetchFromTinybird<TinybirdActiveContributorsSummary>(
      '/v0/pipes/active_contributors.json',
      {
        project,
        repos,
        includeCodeContributions: true,
        includeCollaborations: false,
        startDate: now.minus({ days: 365 }),
        endDate: now,
      },
    );
    if (!res.data || res.data.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' });
    }
    const activeContributors = res.data[0].contributorCount;
    const label = encodeURIComponent('Active contributors (1Y)');
    const message = encodeURIComponent(formatNumberShort(activeContributors || 0));
    const url = `https://img.shields.io/static/v1?label=${label}&message=${message}&color=0094FF&logo=linuxfoundation&logoColor=white&style=flat`;

    return sendRedirect(event, url, 302);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      (error as { statusCode?: number }).statusCode === 404
    ) {
      throw error;
    }
    logError('badge/active-contributors', 'Failed to fetch active contributors badge', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
