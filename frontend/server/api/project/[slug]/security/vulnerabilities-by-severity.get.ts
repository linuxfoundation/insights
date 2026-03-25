// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { VulnerabilityBySeverity } from '~~/types/security/vulnerabilities.types';

export default defineEventHandler(async (event): Promise<VulnerabilityBySeverity[] | Error> => {
  const query = getQuery(event);
  let repos: string[] | undefined;
  if (Array.isArray(query.repos)) {
    repos = query.repos as string[];
  } else if (query.repos) {
    repos = [query.repos as string];
  }
  const project = (event.context.params as { slug: string }).slug;

  try {
    const res = await fetchFromTinybird<VulnerabilityBySeverity[]>(
      '/v0/pipes/vulnerabilities_by_severity.json',
      { project, repos },
    );
    return res.data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404) throw err;
    console.error('Error fetching vulnerabilities by severity:', err);
    return createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
