// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import { getAuthUsername } from '~~/server/utils/common';

/**
 * API Endpoint: DELETE /api/collection/community/:id
 * Description: Soft-deletes a community collection owned by the authenticated user.
 *
 * URL Parameters:
 * - id (string, required): Collection ID
 *
 * Response:
 * - 200: Success
 * - 401: Unauthorized
 * - 403: Forbidden (not the owner)
 * - 404: Collection not found
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<{ success: boolean } | Error> => {
  const user = event.context.user as DecodedOidcToken | undefined;

  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const { id } = event.context.params as Record<string, string>;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Collection ID is required' });
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

    const repo = new CommunityCollectionRepository(cmDbPool);
    await repo.destroy(id, ssoUser.id);

    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error deleting community collection:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
