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
 * - repositoryUrls (string[], optional): List of repository URLs
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

  if (body?.projects !== undefined) {
    if (!Array.isArray(body.projects) || body.projects.some((p) => typeof p !== 'string' || !p)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'projects must be an array of non-empty strings',
      });
    }

    if (body.projects.length > 1000) {
      throw createError({ statusCode: 400, statusMessage: 'projects cannot exceed 1000 items' });
    }
  }

  if (body?.repositoryUrls !== undefined) {
    if (
      !Array.isArray(body.repositoryUrls) ||
      body.repositoryUrls.some((u) => typeof u !== 'string' || !u)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'repositoryUrls must be an array of non-empty strings',
      });
    }

    if (body.repositoryUrls.length > 1000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'repositoryUrls cannot exceed 1000 items',
      });
    }
  }

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    // Fetch existing collection to check visibility and fill in missing fields for guardrails
    const repo = new CommunityCollectionRepository(cmDbPool);
    const existing = await repo.findById(id);
    const willBePublic =
      body.isPrivate === false || (body.isPrivate === undefined && !existing.isPrivate);

    // Run guardrail checks on name and description if the collection will be public
    if (willBePublic) {
      const fieldsToCheck = [
        { field: 'name', value: (body.name ?? existing.name).trim() },
        ...(body.description || existing.description
          ? [
              {
                field: 'description',
                value: (body.description ?? existing.description ?? '').trim(),
              },
            ]
          : []),
      ];

      const guardrailResult = await checkGuardrails(fieldsToCheck);

      if (guardrailResult.blocked) {
        throw createError({
          statusCode: 422,
          statusMessage: guardrailResult.message,
          data: { field: guardrailResult.field },
        });
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

    return await repo.update(id, ssoUser.id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      isPrivate: body.isPrivate,
      projects: body.projects,
      repositoryUrls: body.repositoryUrls,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error updating community collection:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
