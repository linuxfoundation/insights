// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { Leaderboard } from '~~/types/leaderboard/leaderboard';
import { Pagination } from '~~/types/shared/pagination';

export default defineEventHandler(async (event): Promise<Pagination<Leaderboard>> => {
  const { type } = event.context.params as Record<string, string>;
  const query = getQuery(event);

  const page: number = (query.page as number) || 0;
  const pageSize: number = (query.pageSize as number) || 20;
  const search: string | undefined = (query.search as string) || undefined;

  if (!type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Leaderboard key is required',
    });
  }

  try {
    const response = await fetchFromTinybird<Leaderboard[]>('/v0/pipes/leaderboards.json', {
      leaderboardType: type,
      page,
      pageSize,
      search,
    });

    return {
      data: response.data,
      page: page,
      pageSize: pageSize,
      total: response.rows_before_limit_at_least,
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leaderboard',
    });
  }
});
