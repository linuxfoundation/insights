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
    return createError({ statusCode: 422, statusMessage: 'Invalid request' });
  }

  const data = { ...body.data };
  if (data.viewKeywords.length > 0 && !data.viewKeywords.includes(data.keyword)) {
    const commonKeywords = data.keywords.filter((kw) => data.viewKeywords.includes(kw));
    if (commonKeywords.length > 0) {
      data.keyword = commonKeywords[0];
    }
  }

  await addDataToTinybirdDatasource('mentions', {
    ...data,
    projectSlug: slug,
  });
  return true;
});
