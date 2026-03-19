// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import {
  CommunityCollectionRepository,
  type CommunityCollection,
} from '~~/server/repo/communityCollection.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import type { Collection } from '~~/types/collection';
import type { ProjectInsightsTinybird } from '~~/types/project';
import type { Pagination } from '~~/types/shared/pagination';
import { getAuthUsername } from '~~/server/utils/common';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

/**
 * API Endpoint: GET /api/collection/community/my
 * Description: Returns a paginated list of community collections owned by the authenticated user.
 *
 * Query Parameters:
 * - page (number, optional): The page number to fetch (default is 0).
 * - pageSize (number, optional): The number of items per page (default is 10).
 *
 * Response:
 * - 200: Paginated list of collections
 * - 401: Unauthorized
 * - 500: Internal Server Error
 */
export default defineEventHandler(
  async (event): Promise<Pagination<CommunityCollection> | Error> => {
    const user = event.context.user as DecodedOidcToken | undefined;

    if (!user?.sub) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const cmDbPool = event.context.cmDbPool as Pool | undefined;

    if (!cmDbPool) {
      throw createError({ statusCode: 503, statusMessage: 'Database not available' });
    }

    const query = getQuery(event);
    const page: number = Number(query?.page) || 0;
    const pageSize: number = Number(query?.pageSize) || 10;

    try {
      const username = getAuthUsername(user.sub);

      const ssoUserRepo = new InsightsSsoUserRepository(cmDbPool);
      const ssoUser = await ssoUserRepo.findByUsername(username);

      if (!ssoUser) {
        return {
          page,
          pageSize,
          total: 0,
          data: [],
        };
      }

      const repo = new CommunityCollectionRepository(cmDbPool);
      const result = await repo.findBySsoUserId(ssoUser.id, { page, pageSize });

      const owner = {
        name: ssoUser.displayName || '',
        logo: ssoUser.avatarUrl || '',
      };

      const data = result.data.map((c) => ({ ...c, owner })) as unknown as (Collection & {
        _needsFeaturedFallback?: boolean;
        _projectIds?: string[];
      })[];

      // Fetch featured projects from Tinybird for collections without starred projects
      const collectionsNeedingFallback = data.filter((c) => c._needsFeaturedFallback);
      if (collectionsNeedingFallback.length > 0) {
        const allProjectIds = [
          ...new Set(collectionsNeedingFallback.flatMap((c) => c._projectIds || [])),
        ];

        if (allProjectIds.length > 0) {
          try {
            const response = await fetchFromTinybird<ProjectInsightsTinybird[]>(
              '/v0/pipes/project_insights.json',
              {
                ids: allProjectIds,
                orderByField: 'contributorCount',
                orderByDirection: 'desc',
                pageSize: allProjectIds.length,
                page: 0,
              },
            );

            const tinybirdProjects = response.data.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              logo: p.logoUrl,
            }));

            for (const collection of collectionsNeedingFallback) {
              const projectIdSet = new Set(collection._projectIds || []);
              collection.featuredProjects = tinybirdProjects
                .filter((p) => projectIdSet.has(p.id))
                .slice(0, 5)
                .map(({ name, slug, logo }) => ({ name, slug, logo }));
            }
          } catch (error) {
            console.error('Error fetching featured projects from Tinybird:', error);
          }
        }
      }

      // Clean up internal fields before returning
      const cleanData = data.map(({ _needsFeaturedFallback, _projectIds, ...rest }) => rest);

      return {
        page,
        pageSize,
        total: result.total,
        data: cleanData as CommunityCollection[],
      };
    } catch (error) {
      console.error('Error fetching user collections:', error);
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
  },
);
