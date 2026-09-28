// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getHealthScoreV2Config, isPartialHealthScore } from '~~/config/trust-score';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { logError } from '~~/server/utils/log';
import type { ProjectInsightsTinybird } from '~~/types/project';

export default defineEventHandler(async (event): Promise<void> => {
  const query = getQuery(event);
  const project: string = query?.project as string;

  try {
    const res = await fetchFromTinybird<ProjectInsightsTinybird[]>(
      '/v0/pipes/project_insights.json',
      { slug: project },
    );
    if (!res.data || res.data.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' });
    }
    const { healthLabel, healthMaxScore, healthScoreV2 } = res.data[0];
    const isPartial = isPartialHealthScore(healthMaxScore);
    const config = getHealthScoreV2Config(healthLabel, isPartial);
    const message = encodeURIComponent(
      isPartial ? `${config.label} (${healthScoreV2}/${healthMaxScore})` : config.label,
    );
    const label = encodeURIComponent('Health Score');
    const color = config.ghBadgeColor.replace('#', '');
    const url = `https://img.shields.io/static/v1?label=${label}&message=${message}&color=${color}&logo=linuxfoundation&logoColor=white&style=flat`;

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
    logError('badge/health-score', 'Failed to fetch health score badge', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
