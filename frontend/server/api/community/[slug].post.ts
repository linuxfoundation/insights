// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { OctolensWebhook } from '~~/types/community/community';
import { addDataToTinybirdDatasource } from '~~/server/data/tinybird/tinybird';
import { auth } from '~~/server/utils/jwt';

export default defineEventHandler(async (event): Promise<boolean> => {
  const testBody: OctolensWebhook = await readBody(event);
  console.log('testbody', testBody);
  await auth(event);
    console.log('Content-Type:', getHeader(event, 'content-type'));
    console.log('Content-Length:', getHeader(event, 'content-length'));

    const rawBody = await readRawBody(event);
    console.log('Raw body string:', rawBody);

    const body: OctolensWebhook = rawBody ? JSON.parse(rawBody) : null;
    console.log('Parsed body:', body);

/exi
    const body: OctolensWebhook = await readBody(event);
  const { slug } = event.context.params as Record<string, string>;

  console.log('Body', body);
  console.log('Slug', slug);

  if (!slug || !body) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid request' });
  }

  await addDataToTinybirdDatasource('mentions', {
    ...body,
    projectSlug: slug,
  });
  return true;
});
