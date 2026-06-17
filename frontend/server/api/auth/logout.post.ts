// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Auth0 logout endpoint - no longer using OIDC discovery since Auth0 uses proprietary /v2/logout
import { getCookie, setCookie, deleteCookie } from 'h3';
import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { Pool } from 'pg';
import { isValidRedirectUrl } from '../../utils/redirect';
import { SecurityAuditRepository } from '../../repo/securityAudit.repo';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';

const isProduction = process.env.NUXT_APP_ENV === 'production';

/**
 * Clears all insights auth cookies with the correct domain/secure options for the current
 * environment. In production, plain deleteCookie() is insufficient because the browser
 * requires the Set-Cookie attributes (domain, secure, path) to match the original cookie
 * exactly before it will honour a deletion. We therefore force-set each cookie to an empty
 * value with maxAge=0 so the browser always removes it.
 */
const clearAllAuthCookies = (event: H3Event) => {
  const config = useRuntimeConfig();

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    ...(isProduction ? { domain: config.auth0CookieDomain } : { domain: 'localhost' }),
    maxAge: 0,
  };

  setCookie(event, 'insights_oidc_token', '', cookieOptions);
  setCookie(event, 'insights_refresh_token', '', cookieOptions);
  // auth_pkce and auth_redirect_to are short-lived flow cookies — no explicit domain set,
  // so plain deleteCookie is fine here.
  deleteCookie(event, 'auth_pkce');
  deleteCookie(event, 'auth_redirect_to');
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Read optional returnTo from request body and validate it
  let returnToUrl = `${config.public.appUrl}?auth=logout`;
  try {
    const body = await readBody(event);
    const insightsDbPool = event.context.insightsDbPool as Pool;
    if (body?.returnTo) {
      if (isValidRedirectUrl(body.returnTo)) {
        // Build absolute URL if relative path provided
        const validatedReturnTo = body.returnTo.startsWith('/')
          ? `${config.public.appUrl}${body.returnTo}`
          : body.returnTo;
        returnToUrl = validatedReturnTo.includes('?')
          ? `${validatedReturnTo}&auth=logout`
          : `${validatedReturnTo}?auth=logout`;
      } else {
        if (insightsDbPool) {
          // Log invalid redirect attempt for security monitoring
          const securityAuditRepo = new SecurityAuditRepository(insightsDbPool);
          // Fire-and-forget: don't await to avoid blocking the request
          securityAuditRepo.logInvalidRedirect(
            '/api/auth/logout',
            body.returnTo,
            getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip'),
            getHeader(event, 'user-agent'),
          );
        }
      }
    }
  } catch {
    // Body parsing failed, use default returnTo
    returnToUrl = `${config.public.appUrl}?auth=logout`;
  }

  try {
    // Get the OIDC token for logout (don't delete yet - we need it for proper logout)
    const oidcToken = getCookie(event, 'insights_oidc_token');

    // If we have an OIDC token, extract the original ID token for proper Auth0 logout
    if (oidcToken && config.auth0ClientSecret) {
      try {
        // Verify and decode the OIDC token to get the original ID token
        const decodedToken = jwt.verify(oidcToken, config.auth0ClientSecret, {
          algorithms: ['HS256'],
        }) as DecodedOidcToken;

        // Use the original ID token for Auth0 logout if available
        const originalIdToken = decodedToken.original_id_token;

        if (originalIdToken) {
          // Skip OIDC discovery for Auth0 and construct logout URL manually
          // Auth0 uses /v2/logout, not the standard OIDC /oidc/logout endpoint
          const isProduction = process.env.NUXT_APP_ENV === 'production';
          let logoutUrl: string;

          // Strictly check the hostname using the URL API
          let parsedAuth0Domain: URL;
          try {
            parsedAuth0Domain = new URL(
              config.public.auth0Domain.startsWith('http')
                ? config.public.auth0Domain
                : `https://${config.public.auth0Domain}`,
            );
          } catch {
            parsedAuth0Domain = { hostname: '' } as URL; // fallback in case parsing fails
          }

          if (isProduction && parsedAuth0Domain.hostname === 'sso.linuxfoundation.org') {
            // For Linux Foundation SSO, use their logout endpoint with ID token hint
            const logoutParams = new URLSearchParams({
              returnTo: returnToUrl,
              client_id: config.public.auth0ClientId,
            });

            // Add ID token hint if available for proper SSO logout
            if (originalIdToken) {
              logoutParams.set('id_token_hint', originalIdToken);
            }

            logoutUrl = `https://sso.linuxfoundation.org/v2/logout?${logoutParams.toString()}`;
          } else {
            // For standard Auth0 domains, use the standard logout endpoint
            const auth0Domain = config.public.auth0Domain.replace('https://', '');
            const logoutParams = new URLSearchParams({
              returnTo: returnToUrl,
              client_id: config.public.auth0ClientId,
            });

            // Add ID token hint if available
            if (originalIdToken) {
              logoutParams.set('id_token_hint', originalIdToken);
            }

            logoutUrl = `https://${auth0Domain}/v2/logout?${logoutParams.toString()}`;
          }

          // Clear all auth cookies after successful logout URL generation
          clearAllAuthCookies(event);

          return {
            success: true,
            logoutUrl,
          };
        }
      } catch (tokenError) {
        console.error('Error decoding OIDC token for logout:', tokenError);
        // Continue with fallback logout
      }
    }

    // Clear all auth cookies for fallback case
    clearAllAuthCookies(event);

    return {
      success: true,
      logoutUrl: returnToUrl,
    };
  } catch (error) {
    console.error('Auth logout error:', error);

    // Still clear cookies even if logout URL generation fails
    clearAllAuthCookies(event);

    return {
      success: true,
      logoutUrl: returnToUrl,
    };
  }
});
