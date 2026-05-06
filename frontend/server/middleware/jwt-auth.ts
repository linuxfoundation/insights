// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { isLocal } from '../utils/common';
import { verifyOrRefreshOidcToken } from '../utils/auth-refresh';

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
  const publicReportRoutes = [
    '/api/report/cncf/geo-distribution',
    '/api/report/ai-code-tracker',
    '/api/report/agentic-ai-momentum',
  ];
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

  // Verifies the OIDC cookie or transparently refreshes via auth_refresh_token if expired.
  const decodedToken = await verifyOrRefreshOidcToken(event);

  if (!decodedToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header required',
    });
  }

  if (!decodedToken.original_id_token || !isJWT(decodedToken.original_id_token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token format',
    });
  }

  event.context.user = decodedToken;

  if (!isLocal && isPermissionRequired && !decodedToken.hasLfxInsightsPermission) {
    throw createError({
      statusCode: 401,
      statusMessage: `User does not belong to ${config.lfxAuth0TokenClaimGroupName}`,
    });
  }
});
