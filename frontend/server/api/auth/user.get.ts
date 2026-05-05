// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { getCookie } from 'h3';
import { jwtDecode } from 'jwt-decode';
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
        token: null,
        shouldAttemptSilentLogin,
      };
    }

    // Extract Intercom claims from the original Auth0 ID token
    let intercomJwt: string | undefined;
    let username: string | undefined;
    if (decodedToken.original_id_token) {
      try {
        const idTokenClaims = jwtDecode<Record<string, string>>(decodedToken.original_id_token);
        intercomJwt = idTokenClaims['http://lfx.dev/claims/intercom'];
        username = idTokenClaims['https://sso.linuxfoundation.org/claims/username'];
      } catch (error) {
        console.error('Intercom: Boot failed', error);
      }
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
        username,
        intercomJwt,
      },
      token: decodedToken.original_id_token,
    };
  } catch (error) {
    console.error('Auth user error:', error);
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }
});
