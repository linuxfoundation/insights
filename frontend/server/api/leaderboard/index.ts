// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { Leaderboard, LeaderboardTinybird } from '~~/types/leaderboard/leaderboard';
import { Pagination } from '~~/types/shared/pagination';

export default defineEventHandler(async (event): Promise<Pagination<Leaderboard>> => {
  const query = getQuery(event);

  const page: number = (query.page as number) || 0;
  const pageSize: number = (query.pageSize as number) || 20;
  const maxRank: number | undefined = (query.maxRank as number) || undefined;
  const slug: string | undefined = (query.slug as string) || undefined;
  const search: string | undefined = (query.search as string) || undefined;
  const collectionSlug: string | undefined = (query.collectionSlug as string) || undefined;

  try {
    const response = await fetchFromTinybird<LeaderboardTinybird[]>('/v0/pipes/leaderboards.json', {
      page,
      pageSize,
      search,
      maxRank,
      slug,
      collectionSlug,
    });

    return {
      data: response.data.map((l) => ({
        ...l,
        isLF: !!l.isLF,
      })),
      page: page,
      pageSize: pageSize,
      total: response.rows_before_limit_at_least,
    };
  } catch (error) {
    console.error('Error fetching leaderboard list:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leaderboard list',
    });
  }
});
