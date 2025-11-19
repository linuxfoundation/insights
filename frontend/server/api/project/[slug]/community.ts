// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { Pagination } from '~~/types/shared/pagination';
import { CommunityMentions } from '~~/types/community/community';

export default defineEventHandler(async (event): Promise<Pagination<CommunityMentions>> => {
  const { slug } = event.context.params as Record<string, string>;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project slug is required',
    });
  }

  const query = getQuery(event);

  const page: number = (query.page as number) || 0;
  const pageSize: number = (query.pageSize as number) || 20;
  const platforms = Array.isArray(query.platforms)
    ? query.platforms
    : query.platforms
      ? [query.platforms]
      : undefined;
  const keywords = Array.isArray(query.keywords)
    ? query.keywords
    : query.keywords
      ? [query.keywords]
      : undefined;
  const sentiments = Array.isArray(query.sentiments)
    ? query.sentiments
    : query.sentiments
      ? [query.sentiments]
      : undefined;
  const languages = Array.isArray(query.languages)
    ? query.languages
    : query.languages
      ? [query.languages]
      : undefined;

  try {
    const response = await fetchFromTinybird<CommunityMentions[]>('/v0/pipes/mentions_list.json', {
      page,
      pageSize,
      platforms,
      keywords,
      sentiments,
      languages,
      projectSlug: slug,
    });

    return {
      data: response.data,
      page: page,
      pageSize: pageSize,
      total: response.rows_before_limit_at_least,
    };
  } catch (error) {
    console.error('Error fetching mentions list:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch mentions list',
    });
  }
});
