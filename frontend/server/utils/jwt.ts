// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';

/**
 * Auth middleware for static jwt - supports both Authorization header and auth query parameter
 * @param event - H3 event object
 * @returns Promise that resolves when authentication is successful or throws error
 */
export async function auth(event: H3Event): Promise<void> {
  const config = useRuntimeConfig();

  const authHeader = getHeader(event, 'authorization');
  const query = getQuery(event);
  const queryToken = query.auth as string | undefined;

  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    });
  } catch (jwtError) {
    console.error('JWT verification failed:', jwtError);
    throw createError({
      statusCode: 401,
      statusMessage: jwtError instanceof Error ? jwtError.message : 'Invalid JWT token',
    });
  }
}

/**
 * Checks if a JWT token contains the required group claims for LFX Insights access
 * @param token - The JWT token string
 * @returns boolean - true if user has required permissions, false otherwise
 */
export const hasLfxInsightsPermission = (claims?: string[]): boolean => {
  const config = useRuntimeConfig();
  const appEnv = config.public.appEnv;

  const isLocal = appEnv !== 'staging' && appEnv !== 'production';

  // In local we don't have SSO Groups so we should always allow to use the feature
  if (isLocal) {
    return true;
  }

  if (!claims) {
    return false;
  }

  return claims.includes(config.lfxAuth0TokenClaimGroupName);
};

export const isLfInsightsTeamMember = (email: string): boolean => {
  const config = useRuntimeConfig();
  const lfxInsightsTeam = config.lfxInsightsTeam || '';
  return lfxInsightsTeam.split(',').includes(email);
};
