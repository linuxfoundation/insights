// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { CollectionLikeRepository, type LikedCollection } from '~~/server/repo/collectionLike.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import type { Pagination } from '~~/types/shared/pagination';
import { getAuthUsername } from '~~/server/utils/common';

/**
 * API Endpoint: GET /api/collection/like
 * Description: Returns a paginated list of collections liked by the authenticated user.
 *
 * Query Parameters:
 * - page (number, optional): The page number to fetch (default is 0).
 * - pageSize (number, optional): The number of items per page (default is 10).
 *
 * Response:
 * - 200: Paginated list of liked collections with author, name, description, logo, project count, and updatedAt
 * - 401: Unauthorized
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<Pagination<LikedCollection> | Error> => {
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

    const repo = new CollectionLikeRepository(cmDbPool);
    const result = await repo.findLikedByUser(ssoUser.id, { page, pageSize });

    return {
      page,
      pageSize,
      total: result.total,
      data: result.data,
    };
  } catch (error) {
    console.error('Error fetching liked collections:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
