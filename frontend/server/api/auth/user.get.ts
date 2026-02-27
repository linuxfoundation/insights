// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const oidcToken = getCookie(event, 'auth_oidc_token');

    if (!oidcToken) {
      // Check if this is a request that should attempt silent login
      const userAgent = getHeader(event, 'user-agent') || '';
      const referer = getHeader(event, 'referer') || '';

      // Only attempt silent login for browser requests (not API calls from other sources)
      // and avoid infinite loops by checking if we're already in a callback
      const isBrowserRequest = userAgent.includes('Mozilla');
      const isNotCallback = !referer.includes('/api/auth/callback');

      // Check if silent login was already attempted by looking for the silent login cookies
      const silentLoginState = getCookie(event, 'auth_state');
      const silentLoginCodeVerifier = getCookie(event, 'auth_code_verifier');
      const hasAttemptedSilentLogin = !!(silentLoginState && silentLoginCodeVerifier);

      const shouldAttemptSilentLogin =
        isBrowserRequest && isNotCallback && !hasAttemptedSilentLogin;

      return {
        isAuthenticated: false,
        user: null,
        token: null,
        shouldAttemptSilentLogin,
      };
    }

    // Validate client secret
    if (!config.auth0ClientSecret) {
      console.error('Auth0 client secret not configured');
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    // Verify and decode the OIDC token using the client secret
    const decodedToken = jwt.verify(oidcToken, config.auth0ClientSecret, {
      algorithms: ['HS256'],
    }) as DecodedOidcToken;

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
