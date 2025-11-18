// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const token = query.token as string;

    console.log(query);

    // Validate token
    if (token !== process.env.NUXT_OCTOLENS_WEBHOOK_TOKEN) {
      return sendError(
        event,
        createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid token' }),
      );
    }

    const body = await readBody(event);

    console.log(body);

    const tinybirdUrl = `${process.env.NUXT_TINYBIRD_EVENTS_API}?name=octolens_projects_mentions&token=${process.env.NUXT_OCTOLENS_TINYBIRD_TOKEN}`;

    const res = await $fetch(tinybirdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return res;
  } catch (err) {
    console.error('Proxy error:', err);
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: 'Failed to send message to Tinybird' }),
    );
  }
});
