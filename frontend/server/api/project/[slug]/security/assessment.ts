// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { SecurityData } from '~~/types/security/responses.types';

export default defineEventHandler(async (event): Promise<SecurityData[] | Error> => {
  const query = getQuery(event);
  const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

  const project = (event.context.params as { slug: string }).slug;
  try {
    const res = await fetchFromTinybird<SecurityData[]>(
      '/v0/pipes/security_and_best_practices.json',
      {
        project,
        repos,
      },
    );
    return res.data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err;
    }
    console.error('Error fetching project security details:', err);
    return createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
