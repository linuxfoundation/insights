// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import { isLocal } from '../utils/common';
import { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';

const isJWT = (token: string) => {
  const parts = token.split('.');
  return parts.length === 3;
};

export default defineEventHandler(async (event) => {
  const url = getRouterParam(event, '_') || event.node.req.url || '';

  const protectedRoutes = [
    '/api/community/list',
    '/api/security/update',
    '/api/collection/community',
    '/api/collection/like',
  ];

  // Public report routes that don't require authentication
  const publicReportRoutes = ['/api/report/cncf/geo-distribution'];
  const isPublicReport = publicReportRoutes.some((route) => url.startsWith(route));
  if (isPublicReport) {
    return;
  }

  // Protected report routes (other /api/report endpoints)
  const isProtectedReport = url.startsWith('/api/report') && !isPublicReport;
  const isProtectedVulnerabilityRoute = url.includes('/security/vulnerabilities');
  const protectedAndPermissionRoutes = ['/api/chat'];

  const isProtectedRoute =
    [...protectedRoutes, ...protectedAndPermissionRoutes].some((route) => url.startsWith(route)) ||
    isProtectedReport ||
    isProtectedVulnerabilityRoute;

  const isPermissionRequired = protectedAndPermissionRoutes.some((route) => url.startsWith(route));

  if (!isProtectedRoute) {
    return;
  }

  const config = useRuntimeConfig();
  const oidcToken = getCookie(event, 'auth_oidc_token');

  if (!oidcToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header required',
    });
  }

  try {
    // Verify and decode the OIDC token using the client secret
    const decodedToken = jwt.verify(oidcToken, config.auth0ClientSecret, {
      algorithms: ['HS256'],
    }) as DecodedOidcToken;

    if (decodedToken.original_id_token && isJWT(decodedToken.original_id_token)) {
      event.context.user = decodedToken;

      if (!isLocal && isPermissionRequired && !decodedToken.hasLfxInsightsPermission) {
        throw createError({
          statusCode: 401,
          statusMessage: `User does not belong to ${config.lfxAuth0TokenClaimGroupName}`,
        });
      }
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token format',
      });
    }
  } catch (jwtError) {
    console.error('JWT verification failed:', jwtError);
    throw createError({
      statusCode: 401,
      statusMessage: jwtError instanceof Error ? jwtError.message : 'Invalid JWT token',
    });
  }
});
