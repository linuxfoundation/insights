// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ProjectInsights } from '~~/types/project';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { useApiTrackEvent } from '~~/server/utils/plausible';

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params as Record<string, string>;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project slug is required',
    });
  }

  try {
    const response = await fetchFromTinybird<ProjectInsights[]>('/v0/pipes/project_insights.json', {
      slug,
    });

    useApiTrackEvent({
      event,
      eventName: 'pageview',
      url: `/project/${slug}`,
      referrer: `https://www.cncf.io/projects/${slug}`,
      options: {
        props: { project: slug },
      },
    });

    return response.data?.[0];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error;
    }
    console.error('Error fetching project insights:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch project insights',
    });
  }
});
