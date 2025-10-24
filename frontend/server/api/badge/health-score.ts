// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { HealthScoreTinybird } from '~~/types/overview/responses.types';
import { getHealthScoreConfig } from '~~/config/trust-score';

export default defineEventHandler(async (event): Promise<void> => {
  const query = getQuery(event);
  const project: string = query?.project as string;

  try {
    const res = await fetchFromTinybird<HealthScoreTinybird[]>(
      '/v0/pipes/health_score_overview.json',
      { project },
    );
    if (!res.data || res.data.length === 0) {
      return;
    }
    const healthScore = res.data[0].overallScore;
    const config = getHealthScoreConfig(healthScore);
    const message = encodeURIComponent(config.label);
    const label = encodeURIComponent('Health Score');
    const color = config.ghBadgeColor.replace('#', '');
    const url = `https://img.shields.io/static/v1?label=${label}&message=${message}&color=${color}&logo=linuxfoundation&logoColor=white&style=flat`;

    return sendRedirect(event, url, 302);
  } catch (error) {
    console.error('Error fetching badge', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
