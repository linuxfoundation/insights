// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { getCookie, setCookie, deleteCookie } from 'h3';
import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { discovery, refreshTokenGrant } from 'openid-client';
import { hasLfxInsightsPermission, isLfInsightsTeamMember } from './jwt';
import type { DecodedIdToken, DecodedOidcToken } from '~~/types/auth/auth-jwt.types';

const isProduction = process.env.NUXT_APP_ENV === 'production';

export interface RefreshResult {
  oidcToken: string;
  decoded: DecodedOidcToken;
}

interface RawRefresh {
  oidcToken: string;
  decoded: DecodedOidcToken;
  newRefreshToken?: string;
  expiresIn: number;
}

// Dedup concurrent refreshes for the same refresh token to avoid races against
// Auth0 refresh-token rotation (the second concurrent call would otherwise be rejected).
const inFlightRefreshes = new Map<string, Promise<RawRefresh | null>>();

const callAuth0Refresh = async (refreshToken: string): Promise<RawRefresh | null> => {
  const config = useRuntimeConfig();

  if (!config.auth0ClientSecret) {
    console.error('Auth0 client secret not configured for refresh');
    return null;
  }

  try {
    const authConfig = await discovery(
      new URL(`https://${config.public.auth0Domain}`),
      config.public.auth0ClientId,
    );

    const tokenResponse = await refreshTokenGrant(authConfig, refreshToken);

    if (!tokenResponse.id_token) {
      console.error('Refresh token grant returned no id_token');
      return null;
    }

    const decodedIdToken = jwtDecode(tokenResponse.id_token) as DecodedIdToken;
    const claims = decodedIdToken[config.lfxAuth0TokenClaimGroupKey];
    const expiresIn = tokenResponse.expires_in || 86400;

    const oidcTokenPayload = {
      sub: decodedIdToken.sub,
      name: decodedIdToken.name,
      email: decodedIdToken.email,
      picture: decodedIdToken.picture,
      email_verified: decodedIdToken.email_verified,
      updated_at: decodedIdToken.updated_at,
      iss: config.public.auth0Domain,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn,
      claims,
      hasLfxInsightsPermission: hasLfxInsightsPermission(claims as string[]),
      isLfInsightsTeamMember: isLfInsightsTeamMember(decodedIdToken.email || ''),
      original_id_token: tokenResponse.id_token,
    };

    const oidcToken = jwt.sign(oidcTokenPayload, config.auth0ClientSecret, {
      algorithm: 'HS256',
    });

    return {
      oidcToken,
      decoded: oidcTokenPayload as DecodedOidcToken,
      newRefreshToken: tokenResponse.refresh_token,
      expiresIn,
    };
  } catch (error) {
    // Scrub: openid-client errors can carry the response body in the message,
    // which on some Auth0 failure paths includes a refresh_token field.
    const message = error instanceof Error ? error.name : 'unknown';
    console.error('Token refresh failed:', message);
    return null;
  }
};

const setRefreshedCookies = (event: H3Event, result: RawRefresh) => {
  const config = useRuntimeConfig();

  const tokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    ...(isProduction ? { domain: config.auth0CookieDomain } : { domain: 'localhost' }),
    maxAge: result.expiresIn,
  };

  setCookie(event, 'auth_oidc_token', result.oidcToken, tokenCookieOptions);

  if (result.newRefreshToken) {
    setCookie(event, 'auth_refresh_token', result.newRefreshToken, {
      ...tokenCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
};

const clearAuthCookies = (event: H3Event) => {
  deleteCookie(event, 'auth_oidc_token');
  deleteCookie(event, 'auth_refresh_token');
};

/**
 * Attempts to refresh the OIDC token using the auth_refresh_token cookie.
 * On success: re-issues auth_oidc_token (and rotated refresh token) cookies on the event response.
 * On failure: clears auth cookies and returns null.
 */
export const refreshOidcToken = async (event: H3Event): Promise<RefreshResult | null> => {
  const refreshToken = getCookie(event, 'auth_refresh_token');
  if (!refreshToken) {
    return null;
  }

  let promise = inFlightRefreshes.get(refreshToken);
  if (!promise) {
    promise = callAuth0Refresh(refreshToken).finally(() => {
      inFlightRefreshes.delete(refreshToken);
    });
    inFlightRefreshes.set(refreshToken, promise);
  }

  const result = await promise;

  if (!result) {
    clearAuthCookies(event);
    return null;
  }

  setRefreshedCookies(event, result);

  return {
    oidcToken: result.oidcToken,
    decoded: result.decoded,
  };
};

/**
 * Verifies the OIDC cookie. If missing, expired, or invalid, transparently attempts a refresh
 * using the refresh token cookie. Returns the decoded payload, or null when no valid session
 * can be re-established.
 */
export const verifyOrRefreshOidcToken = async (
  event: H3Event,
): Promise<DecodedOidcToken | null> => {
  const config = useRuntimeConfig();
  const oidcToken = getCookie(event, 'auth_oidc_token');

  if (oidcToken && config.auth0ClientSecret) {
    try {
      return jwt.verify(oidcToken, config.auth0ClientSecret, {
        algorithms: ['HS256'],
      }) as DecodedOidcToken;
    } catch (error) {
      // Token expired or otherwise invalid — fall through to refresh.
      if (!(error instanceof jwt.TokenExpiredError)) {
        console.error('OIDC token verify failed, attempting refresh:', error);
      }
    }
  }

  const refreshed = await refreshOidcToken(event);
  return refreshed?.decoded ?? null;
};
