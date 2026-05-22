// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Auth0 logout endpoint - no longer using OIDC discovery since Auth0 uses proprietary /v2/logout
import { deleteCookie } from 'h3';
import type { H3Event } from 'h3';
import { Pool } from 'pg';
import { isValidRedirectUrl } from '../../utils/redirect';
import { SecurityAuditRepository } from '../../repo/securityAudit.repo';

const isProduction = process.env.NUXT_APP_ENV === 'production';

const setOIDCCookie = (event: H3Event) => {
  const config = useRuntimeConfig();

  const tokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    // Use 'none' for production to ensure cross-site compatibility with Auth0 redirects
    sameSite: 'lax' as const,
    path: '/',
    // Force domain for production to ensure cookies work across proxy inconsistencies
    ...(isProduction ? { domain: config.auth0CookieDomain } : { domain: 'localhost' }),
    maxAge: 0,
  };

  // auth_oidc_token doesn't clear on prod, so forcing it to set as empty cookie
  setCookie(event, 'auth_oidc_token', '', tokenCookieOptions);
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
    if (isProduction) {
      setOIDCCookie(event);
    } else {
      deleteCookie(event, 'auth_oidc_token');
    }
    deleteCookie(event, 'auth_refresh_token');
    deleteCookie(event, 'auth_pkce');
    deleteCookie(event, 'auth_redirect_to');

    return {
      success: true,
      logoutUrl,
    };
  } catch (error) {
    console.error('Auth logout error:', error);

    // Still clear cookies even if logout URL generation fails
    deleteCookie(event, 'auth_oidc_token');
    deleteCookie(event, 'auth_refresh_token');

    return {
      success: true,
      logoutUrl: returnToUrl,
    };
  }
});
