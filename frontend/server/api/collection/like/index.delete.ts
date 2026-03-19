// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { CollectionLikeRepository } from '~~/server/repo/collectionLike.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import { getAuthUsername } from '~~/server/utils/common';
import { invalidateRouteCache } from '~~/server/utils/cache';

/**
 * API Endpoint: DELETE /api/collection/like
 * Description: Unlikes a collection for the authenticated user.
 *
 * Request Body:
 * - collectionId (string, required): The ID of the collection to unlike
 *
 * Response:
 * - 200: Success
 * - 400: Validation error
 * - 401: Unauthorized
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<{ success: boolean } | Error> => {
  const user = event.context.user as DecodedOidcToken | undefined;

  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody<{ collectionId?: string }>(event);

  if (!body?.collectionId?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'collectionId is required' });
  }

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const username = getAuthUsername(user.sub);

    const ssoUserRepo = new InsightsSsoUserRepository(cmDbPool);
    const ssoUser = await ssoUserRepo.findByUsername(username);

    if (!ssoUser) {
      return { success: true };
    }

    const repo = new CollectionLikeRepository(cmDbPool);
    await repo.unlike(body.collectionId.trim(), ssoUser.id);

    // Invalidate cached collection endpoints so like counts are fresh
    await invalidateRouteCache(['collection']);

    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error unliking collection:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
