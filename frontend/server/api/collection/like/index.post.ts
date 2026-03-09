// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { CollectionLikeRepository } from '~~/server/repo/collectionLike.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import { getAuthUsername } from '~~/server/utils/common';

/**
 * API Endpoint: POST /api/collection/like
 * Description: Likes a collection for the authenticated user.
 *
 * Request Body:
 * - collectionId (string, required): The ID of the collection to like
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
    const ssoUser = await ssoUserRepo.upsert({
      id: user.sub,
      displayName: user.name,
      avatarUrl: user.picture,
      email: user.email,
      username,
    });

    const collectionId = body.collectionId.trim();

    const repo = new CollectionLikeRepository(cmDbPool);
    await repo.like(collectionId, ssoUser.id);

    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    // FK violation means the collection doesn't exist
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === '23503'
    ) {
      throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }
    console.error('Error liking collection:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
