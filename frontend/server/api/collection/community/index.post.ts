// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import {
  CommunityCollectionRepository,
  type CommunityCollection,
  type CreateCommunityCollectionInput,
} from '~~/server/repo/communityCollection.repo';
import { InsightsSsoUserRepository } from '~~/server/repo/insightsSsoUser.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import { getAuthUsername } from '~~/server/utils/common';
import { checkGuardrails } from '~~/server/utils/guardrail';

/**
 * API Endpoint: POST /api/collection/community
 * Description: Creates a new community collection for the authenticated user.
 *
 * Request Body:
 * - name (string, required): Collection name
 * - description (string, optional): Collection description
 * - isPrivate (boolean, optional): Whether the collection is private (default: false)
 * - projects (string[], optional): List of project IDs
 *
 * Response:
 * - 201: Created collection
 * - 400: Validation error
 * - 401: Unauthorized
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<CommunityCollection | Error> => {
  const user = event.context.user as DecodedOidcToken | undefined;

  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody<Partial<CreateCommunityCollectionInput>>(event);

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' });
  }

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    // Run guardrail checks on name and description if collection is public
    if (!body.isPrivate) {
      const guardrailResult = await checkGuardrails([
        { field: 'name', value: body.name.trim() },
        { field: 'description', value: body.description?.trim() || '' },
      ]);

      if (guardrailResult.blocked) {
        throw createError({
          statusCode: 422,
          statusMessage: guardrailResult.message,
          data: { field: guardrailResult.field },
        });
      }
    }

    // Derive username from Auth0 sub (e.g. "auth0|abc123" -> "abc123")
    const username = getAuthUsername(user.sub);

    // Upsert SSO user
    const ssoUserRepo = new InsightsSsoUserRepository(cmDbPool);
    const ssoUser = await ssoUserRepo.upsert({
      id: user.sub,
      displayName: user.name,
      avatarUrl: user.picture,
      email: user.email,
      username,
    });

    const repo = new CommunityCollectionRepository(cmDbPool);
    const collection = await repo.create({
      name: body.name.trim(),
      description: body.description?.trim(),
      isPrivate: body.isPrivate,
      ssoUserId: ssoUser.id,
      projects: body.projects,
    });

    setResponseStatus(event, 201);
    return collection;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error creating community collection:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
