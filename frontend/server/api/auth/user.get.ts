// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { getCookie } from 'h3';
import { verifyOrRefreshOidcToken } from '~~/server/utils/auth-refresh';

export default defineEventHandler(async (event) => {
  try {
    const decodedToken = await verifyOrRefreshOidcToken(event);

    if (!decodedToken) {
      // No valid session and refresh either wasn't possible or failed.
      // Suggest silent login only for browser requests that haven't already tried it.
      const userAgent = getHeader(event, 'user-agent') || '';
      const referer = getHeader(event, 'referer') || '';

      const isBrowserRequest = userAgent.includes('Mozilla');
      const isNotCallback = !referer.includes('/api/auth/callback');

      const silentLoginPkce = getCookie(event, 'auth_pkce');
      const hasAttemptedSilentLogin = !!silentLoginPkce;

      const shouldAttemptSilentLogin =
        isBrowserRequest && isNotCallback && !hasAttemptedSilentLogin;

      return {
        isAuthenticated: false,
        user: null,
        shouldAttemptSilentLogin,
      };
    }

    return {
      isAuthenticated: true,
      user: {
        sub: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
        email_verified: decodedToken.email_verified,
        updated_at: decodedToken.updated_at,
        hasLfxInsightsPermission: decodedToken.hasLfxInsightsPermission,
        isLfInsightsTeamMember: decodedToken.isLfInsightsTeamMember,
        username: decodedToken.username,
        intercomJwt: decodedToken.intercomJwt,
      },
    };
  } catch (error) {
    console.error('Auth user error:', error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
});
