// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { ProjectInsightsTinybird } from '~~/types/project';
import type { Pagination } from '~~/types/shared/pagination';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { postToTinybird } from '~~/server/data/tinybird/tinybird';

/**
 * API Endpoint: /api/collection/:slug/projects
 * Method: GET
 * Description: Fetches paginated project insights for a specific collection.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the collection.
 *
 * Query Parameters:
 * - sort (string, optional): Sorting field and direction (e.g., "contributorCount_desc"). Default: "contributorCount_desc".
 * - isLF (string, optional): Filter by LF status ("true" or "false").
 * - page (number, optional): The page number to fetch (0-indexed, default: 0).
 * - pageSize (number, optional): The number of items per page (default: 10).
 *
 * Response:
 * - page (number): The current page number.
 * - pageSize (number): The number of items returned per page.
 * - total (number): The total number of items.
 * - data (Array): The list of project insights.
 *
 * Errors:
 * - 404: Collection not found
 * - 503: Database not available
 * - 500: Internal server error
 */
export default defineEventHandler(async (event): Promise<Pagination<unknown> | Error> => {
  const { slug } = event.context.params as Record<string, string>;
  const query = getQuery(event);

  const sort: string = (query?.sort as string) || 'contributorCount_desc';
  const lastUnderscoreIndex = sort.lastIndexOf('_');
  const orderByField = lastUnderscoreIndex > 0 ? sort.substring(0, lastUnderscoreIndex) : sort;
  const orderByDirection =
    lastUnderscoreIndex > 0 ? sort.substring(lastUnderscoreIndex + 1) : 'desc';
  const isLfx = query?.isLF === 'true' ? 1 : query?.isLF === 'false' ? 0 : undefined;

  const page: number = Number(query?.page) || 0;
  const pageSize: number = Number(query?.pageSize) || 10;

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const repo = new CommunityCollectionRepository(cmDbPool);
    const result = await repo.findProjectIdsBySlug(slug);

    if (!result) {
      throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }

    const { projectIds } = result;

    if (projectIds.length === 0) {
      return {
        page,
        pageSize,
        total: 0,
        data: [],
      };
    }

    const response = await postToTinybird<ProjectInsightsTinybird[]>(
      '/v0/pipes/project_insights.json',
      {
        ids: projectIds,
        isLfx,
        orderByField: orderByField || 'contributorCount',
        orderByDirection: orderByDirection || 'desc',
        pageSize,
        page,
      },
    );

    const data = response.data.map((project) => ({
      ...project,
      isLF: !!project.isLF,
      achievements:
        project.achievements?.map(([leaderboardType, rank, totalCount]) => ({
          leaderboardType,
          rank,
          totalCount,
        })) ?? [],
    }));

    return {
      page,
      pageSize,
      total: response.rows_before_limit_at_least,
      data,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching collection projects:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
