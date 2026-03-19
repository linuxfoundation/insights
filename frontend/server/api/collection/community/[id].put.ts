// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import {
  type CommunityCollection,
  CommunityCollectionRepository,
  type UpdateCommunityCollectionInput,
} from '~~/server/repo/communityCollection.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import { getAuthUsername } from '~~/server/utils/common';
import { checkGuardrails } from '~~/server/utils/guardrail';

/**
 * API Endpoint: PUT /api/collection/community/:id
 * Description: Updates a community collection owned by the authenticated user.
 *
 * URL Parameters:
 * - id (string, required): Collection ID
 *
 * Request Body:
 * - name (string, optional): Collection name
 * - description (string, optional): Collection description
 * - isPrivate (boolean, optional): Whether the collection is private
 * - projects (string[], optional): List of project IDs
 *
 * Response:
 * - 200: Updated collection
 * - 401: Unauthorized
 * - 403: Forbidden (not the owner)
 * - 404: Collection not found
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<CommunityCollection | Error> => {
  const user = event.context.user as DecodedOidcToken | undefined;

  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const { id } = event.context.params as Record<string, string>;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Collection ID is required' });
  }

  const body = await readBody<Partial<UpdateCommunityCollectionInput>>(event);

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    // Run guardrail checks on name and description if the collection will be public
    const fieldsToCheck = [
      ...(body.name ? [{ field: 'name', value: body.name.trim() }] : []),
      ...(body.description ? [{ field: 'description', value: body.description.trim() }] : []),
    ];

    if (fieldsToCheck.length > 0) {
      // If isPrivate is explicitly set, use that; otherwise check the current collection state
      let willBePublic = body.isPrivate === false;

      if (body.isPrivate === undefined) {
        const repo = new CommunityCollectionRepository(cmDbPool);
        const existing = await repo.findById(id);
        willBePublic = !existing.isPrivate;
      }

      if (willBePublic) {
        const guardrailResult = await checkGuardrails(fieldsToCheck);

        if (guardrailResult.blocked) {
          throw createError({
            statusCode: 422,
            statusMessage: guardrailResult.message,
            data: { field: guardrailResult.field },
          });
        }
      }
    }

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
    return await repo.update(id, ssoUser.id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      isPrivate: body.isPrivate,
      projects: body.projects,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error updating community collection:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
