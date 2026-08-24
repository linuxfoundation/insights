// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { OctolensWebhook } from '~~/types/community/community';
import { addDataToTinybirdDatasource } from '~~/server/data/tinybird/tinybird';
import { auth } from '~~/server/utils/jwt';

export default defineEventHandler(async (event): Promise<boolean | Error> => {
  await auth(event);

  const body: OctolensWebhook = await readBody(event);
  const { slug } = event.context.params as Record<string, string>;

  if (!slug || !body?.data) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid request' });
  }

  const raw = body.data;

  if (raw.viewKeywords.length > 0 && !raw.viewKeywords.includes(raw.keyword)) {
    const commonKeywords = raw.keywords.filter((kw) => raw.viewKeywords.includes(kw));
    if (commonKeywords.length > 0) {
      raw.keyword = commonKeywords[0];
    }
  }

  // Pick only the fields defined in the Tinybird schema to avoid quarantine from extra columns.
  // Type coercions: viewId must be Int64 (number), subreddit/language default to '' when absent.
  const record = {
    sourceId: raw.sourceId ?? '',
    url: raw.url ?? '',
    timestamp: raw.timestamp,
    source: raw.source ?? '',
    author: raw.author ?? '',
    authorProfileLink: raw.authorProfileLink ?? '',
    title: raw.title ?? '',
    body: raw.body ?? '',
    imageUrl: raw.imageUrl ?? '',
    relevanceScore: raw.relevanceScore ?? '',
    relevanceComment: raw.relevanceComment ?? '',
    keyword: raw.keyword ?? '',
    sentimentLabel: raw.sentimentLabel ?? '',
    subreddit: raw.subreddit ?? '',
    viewId: Number(raw.viewId) || 0,
    viewName: raw.viewName ?? '',
    viewKeywords: raw.viewKeywords ?? [],
    language: raw.language ?? '',
    projectSlug: slug,
    bookmarked: raw.bookmarked ?? 0,
    keywords: raw.keywords ?? [],
    authorFollowerCount: raw.authorFollowerCount ?? null,
    tags: raw.tags ?? [],
  };

  await addDataToTinybirdDatasource('mentions', record);
  return true;
});
