// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import {
  CommunityCollectionRepository,
  type CommunityCollection,
} from '~~/server/repo/communityCollection.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';

/**
 * API Endpoint: GET /api/collection/community/my
 * Description: Returns all community collections owned by the authenticated user.
 *
 * Response:
 * - 200: List of collections
 * - 401: Unauthorized
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<CommunityCollection[] | Error> => {
  const user = event.context.user as DecodedOidcToken | undefined;

  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const username = user.sub.includes('|') ? user.sub.split('|').pop()! : user.sub;

    const ssoUserRepo = new InsightsSsoUserRepository(cmDbPool);
    const ssoUser = await ssoUserRepo.findByUsername(username);

    if (!ssoUser) {
      return [];
    }

    const repo = new CommunityCollectionRepository(cmDbPool);
    return await repo.findBySsoUserId(ssoUser.id);
  } catch (error) {
    console.error('Error fetching user collections:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
