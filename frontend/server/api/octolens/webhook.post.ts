// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const headers = getHeaders(event); // returns an object with all headers

    // eslint-disable-next-line no-console
    console.log('🔍 Incoming webhook headers:', headers);
    // Forward to Tinybird ingestion endpoint
    const tinybirdUrl = `${process.env.NUXT_TINYBIRD_EVENTS_API}?name=octolens_projects_mentions&token=${process.env.NUXT_OCTOLENS_TINYBIRD_TOKEN}`;

    const res = await fetch(tinybirdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const response = await res.json();
    return response;
  } catch (err) {
    console.error('Proxy error:', err);
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: 'Failed to send message to Tinybird' }),
    );
  }
});
