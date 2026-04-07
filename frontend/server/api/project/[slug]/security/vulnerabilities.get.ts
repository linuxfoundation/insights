// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { VulnerabilityListItem } from '~~/types/security/vulnerabilities.types';
import type { Pagination } from '~~/types/shared/pagination';
import { getBooleanQueryParam } from '~~/server/utils/common';

export default defineEventHandler(
  async (event): Promise<Pagination<VulnerabilityListItem> | Error> => {
    const query = getQuery(event);
    let repos: string[] | undefined;
    if (Array.isArray(query.repos)) {
      repos = query.repos as string[];
    } else if (query.repos) {
      repos = [query.repos as string];
    }
    const project = (event.context.params as { slug: string }).slug;

    const count = getBooleanQueryParam(query, 'count', false);
    const ecosystem: string | undefined = (query.ecosystem as string) || undefined;
    const orderByDirection: string | undefined = (query.orderByDirection as string) || undefined;
    const page: number = Number(query.page) || 0;
    const pageSize: number = Number(query.pageSize) || 20;
    const severity: string | undefined = (query.severity as string) || undefined;
    const status: string | undefined = (query.status as string) || undefined;

    try {
      const res = await fetchFromTinybird<VulnerabilityListItem[]>(
        '/v0/pipes/vulnerabilities_list.json',
        {
          project,
          repos,
          count,
          ecosystem,
          orderByDirection,
          page,
          pageSize,
          severity,
          status,
        },
      );
      return {
        data: res.data,
        page,
        pageSize,
        total: res.rows_before_limit_at_least,
      };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404)
        throw err;
      console.error('Error fetching vulnerabilities list:', err);
      throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
    }
  },
);
