// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ProjectInsights, ProjectTinybird } from '~~/types/project';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { useApiTrackEvent } from '~~/server/utils/plausible';
import { SearchResponse } from '~~/server/api/search';

export default defineEventHandler(async (event) => {
  let { slug } = event.context.params as Record<string, string>;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project slug is required',
    });
  }

  try {
    // Check if project exists
    const project = await fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {
      slug,
      details: false,
      page: 0,
      pageSize: 1,
    });
    // If project doesn't exist, search for it
    if (!project.data?.length) {
      const searchResult = await fetchFromTinybird<ProjectTinybird[]>(
        '/v0/pipes/projects_list.json',
        {
          search: slug.replaceAll('-', ' '),
          details: false,
          page: 0,
          pageSize: 1,
          orderByField: 'contributorCount',
          orderByDirection: 'desc',
        },
      );
      const searchProject = searchResult.data?.[0];
      slug = searchProject?.slug || slug;
    }

    const response = await fetchFromTinybird<ProjectInsights[]>('/v0/pipes/project_insights.json', {
      slug,
    });

    useApiTrackEvent({
      event,
      eventName: 'project-insights-api',
      url: `/project/${slug}`,
      referer: `https://www.cncf.io/projects/${slug}`,
      options: {
        props: { project: slug },
      },
    });

    return response.data?.[0];
  } catch (error) {
    console.error('Error fetching project insights:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch project insights',
    });
  }
});
