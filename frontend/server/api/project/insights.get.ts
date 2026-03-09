// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ProjectInsights } from '~~/types/project';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

/**
 * API Endpoint: /api/project/insights
 * Method: GET
 * Description: Fetches project insights for multiple projects by slugs or IDs.
 *
 * Query Parameters:
 * - slugs (string | string[]): One or more project slugs to fetch insights for.
 * - ids (string | string[]): One or more project IDs to fetch insights for.
 *
 * At least one of `slugs` or `ids` must be provided.
 *
 * Response:
 * - Array of ProjectInsights objects with achievements mapped to structured objects.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const slugs = Array.isArray(query.slugs)
    ? (query.slugs as string[])
    : query.slugs
      ? [query.slugs as string]
      : [];

  const ids = Array.isArray(query.ids)
    ? (query.ids as string[])
    : query.ids
      ? [query.ids as string]
      : [];

  if (slugs.length === 0 && ids.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one project slug or id is required',
    });
  }

  try {
    const response = await fetchFromTinybird<ProjectInsights[]>('/v0/pipes/project_insights.json', {
      slugs: slugs.length > 0 ? slugs : undefined,
      ids: ids.length > 0 ? ids : undefined,
    });

    return response.data.map((project) => ({
      ...project,
      isLF: !!project.isLF,
      achievements:
        project.achievements?.map(([leaderboardType, rank, totalCount]) => ({
          leaderboardType,
          rank,
          totalCount,
        })) ?? [],
    }));
  } catch (error: unknown) {
    console.error('Error fetching project insights:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch project insights',
    });
  }
});
