// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Auth0 logout endpoint - no longer using OIDC discovery since Auth0 uses proprietary /v2/logout
import { setCookie, deleteCookie } from 'h3';
import type { H3Event } from 'h3';
import { Pool } from 'pg';
import { isValidRedirectUrl } from '../../utils/redirect';
import { SecurityAuditRepository } from '../../repo/securityAudit.repo';

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
    // Construct Auth0 logout URL
    let parsedAuth0Domain: URL;
    try {
      parsedAuth0Domain = new URL(
        config.public.auth0Domain.startsWith('http')
          ? config.public.auth0Domain
          : `https://${config.public.auth0Domain}`,
      );
    } catch {
      parsedAuth0Domain = { hostname: '' } as URL;
    }

    const logoutParams = new URLSearchParams({
      returnTo: returnToUrl,
      client_id: config.public.auth0ClientId,
    });

    const auth0Base =
      isProduction && parsedAuth0Domain.hostname === 'sso.linuxfoundation.org'
        ? 'https://sso.linuxfoundation.org'
        : `https://${config.public.auth0Domain.replace('https://', '')}`;

    const logoutUrl = `${auth0Base}/v2/logout?${logoutParams.toString()}`;

    // Clear all auth cookies
    clearAllAuthCookies(event);

    return {
      success: true,
      logoutUrl,
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
