// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import {
  discovery,
  randomState,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  buildAuthorizationUrl,
} from 'openid-client';
import { Pool } from 'pg';

import { SecurityAuditRepository } from '../../repo/securityAudit.repo';
import { isValidRedirectUrl, toSafeRelativePath } from '../../utils/redirect';
import { ssoFrameResponse } from '../../utils/sso-frame';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const isProduction = process.env.NUXT_APP_ENV === 'production';
  const userAgent = getHeader(event, 'user-agent') || '';
  const acceptHeader = getHeader(event, 'accept') || '';
  const isBrowserRequest = userAgent.includes('Mozilla') && acceptHeader.includes('text/html');
  const isFrame = query.silent === 'true' && query.mode === 'frame';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    // Silent attempts get a short window, matching SILENT_LOGIN_ATTEMPT_TTL_MS in useAuth.ts
    maxAge: query.silent === 'true' ? 60 * 2 : 60 * 15,
    // Don't set domain for production - let browser handle it automatically
    // This ensures cookies work with the actual domain (insights.linuxfoundation.org)
    ...(!isProduction && { domain: 'localhost' }),
  };

  try {
    // Discover Auth0 configuration
    const authConfig = await discovery(
      new URL(`https://${config.public.auth0Domain}`),
      config.public.auth0ClientId,
    );

    // Generate state and code verifier for PKCE
    const state = randomState();
    const codeVerifier = randomPKCECodeVerifier();
    const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);

    // Store state and code verifier together in a single cookie to prevent
    // race conditions where concurrent login flows overwrite each other's code verifier
    setCookie(
      event,
      'auth_pkce',
      JSON.stringify({
        state,
        codeVerifier,
        silent: query.silent === 'true',
        ...(isFrame && { frame: true }),
      }),
      cookieOptions,
    );

    // Store redirect URL if provided (validated to prevent open redirect)
    const redirectTo = query.redirectTo as string;
    if (redirectTo) {
      // Log invalid redirect attempts for security monitoring
      if (!isValidRedirectUrl(redirectTo)) {
        const insightsDbPool = event.context.insightsDbPool as Pool;
        if (insightsDbPool) {
          const securityAuditRepo = new SecurityAuditRepository(insightsDbPool);
          // Fire-and-forget: don't await to avoid blocking the request
          securityAuditRepo.logInvalidRedirect(
            '/api/auth/login',
            redirectTo,
            getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip'),
            getHeader(event, 'user-agent'),
          );
        }
      }
      const safeRedirectTo = toSafeRelativePath(redirectTo);
      setCookie(event, 'auth_redirect_to', safeRedirectTo, cookieOptions);
    }

    // Build authorization URL
    const redirectUri = config.public.auth0RedirectUri;

    const authorizationUrl = buildAuthorizationUrl(authConfig, {
      scope: 'openid profile email offline_access',
      audience: config.public.auth0Audience,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: redirectUri,
      // Silent authentication parameters - don't show login UI
      ...(query.silent === 'true' && { prompt: 'none' }),
    });

    // Return the authorization URL for client-side redirect
    // If this is a browser request (not API call), redirect directly
    if (isBrowserRequest) {
      await sendRedirect(event, authorizationUrl.toString());
    } else {
      // If this is an API call, return JSON
      return {
        success: true,
        authorizationUrl: authorizationUrl.toString(),
      };
    }
  } catch (error) {
    console.error('Auth login error:', error);
    // A failed silent attempt should not strand the user on a 500 page
    if (query.silent === 'true' && isBrowserRequest) {
      // auth_pkce is the loop guard for silent-sso.ts and /api/auth/user, so an early failure still sets it.
      setCookie(event, 'auth_pkce', JSON.stringify({ silent: true }), cookieOptions);
      if (isFrame) return ssoFrameResponse(event, 'none');
      return sendRedirect(event, toSafeRelativePath(query.redirectTo as string | undefined));
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication error',
    });
  }
});
