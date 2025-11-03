// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { Leaderboard } from '~~/types/leaderboard/leaderboard';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const page: number = (query.page as number) || 0;
  const pageSize: number = (query.pageSize as number) || 20;
  const maxRank: number | undefined = (query.maxRank as number) || undefined;
  const slug: string | undefined = (query.slug as string) || undefined;
  const search: string | undefined = (query.search as string) || undefined;

  try {
    const response = await fetchFromTinybird<Leaderboard[]>('/v0/pipes/leaderboards.json', {
      page,
      pageSize,
      search,
      maxRank,
      slug,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard list:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch leaderboard list',
    });
  }
});
