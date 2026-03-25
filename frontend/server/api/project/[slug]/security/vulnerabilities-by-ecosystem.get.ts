// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { VulnerabilityByEcosystem } from '~~/types/security/vulnerabilities.types';

export default defineEventHandler(async (event): Promise<VulnerabilityByEcosystem[] | Error> => {
  const query = getQuery(event);
  let repos: string[] | undefined;
  if (Array.isArray(query.repos)) {
    repos = query.repos as string[];
  } else if (query.repos) {
    repos = [query.repos as string];
  }
  const project = (event.context.params as { slug: string }).slug;

  try {
    const res = await fetchFromTinybird<VulnerabilityByEcosystem[]>(
      '/v0/pipes/vulnerabilities_by_ecosystem.json',
      { project, repos },
    );
    return res.data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404) throw err;
    console.error('Error fetching vulnerabilities by ecosystem:', err);
    return createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
