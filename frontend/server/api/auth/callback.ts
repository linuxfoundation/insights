// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { discovery, authorizationCodeGrant } from 'openid-client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  try {
    // Get stored state and code verifier
    const storedState = getCookie(event, 'auth_state')
    const codeVerifier = getCookie(event, 'auth_code_verifier')
    const redirectTo = getCookie(event, 'auth_redirect_to') || '/'

    // Debug logging for state parameter validation
    console.log('Auth callback debug info:', {
      queryState: query.state,
      storedState,
      codeVerifier: codeVerifier ? '[PRESENT]' : '[MISSING]',
      requestUrl: getRequestURL(event).toString(),
      host: getHeader(event, 'host'),
      cookies: getHeader(event, 'cookie') || '[NO COOKIES]',
      userAgent: getHeader(event, 'user-agent'),
      referer: getHeader(event, 'referer'),
      isProduction: process.env.NODE_ENV === 'production',
    })

    // Validate state parameter
    if (!storedState) {
      console.error('No stored state found - cookies may not be preserved during redirect')
      console.error('Cookie debugging - all cookies received:', getHeader(event, 'cookie'))
      console.error('Looking for auth_state cookie specifically')
      throw createError({
        statusCode: 400,
        statusMessage: 'No stored state found. Please try logging in again.',
      })
    }

    if (storedState !== query.state) {
      console.error('State parameter validation failed:', {
        storedState: storedState.substring(0, 8) + '...',
        queryState: query.state ? String(query.state).substring(0, 8) + '...' : 'undefined',
        statesMatch: storedState === query.state,
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid state parameter. Please try logging in again.',
      })
    }

    if (!query.code || !codeVerifier) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing authorization code or code verifier',
      })
    }

    // Discover Auth0 configuration
    const authConfig = await discovery(
      new URL(`https://${config.public.auth0Domain}`),
      config.public.auth0ClientId,
    )

    // Exchange authorization code for tokens
    const tokenResponse = await authorizationCodeGrant(authConfig, new URL(getRequestURL(event)), {
      expectedState: storedState,
      pkceCodeVerifier: codeVerifier,
    })

    // Clean up temporary cookies
    deleteCookie(event, 'auth_state')
    deleteCookie(event, 'auth_code_verifier')
    deleteCookie(event, 'auth_redirect_to')

    // Define consistent cookie options for tokens
    const tokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      // Don't set domain for production - let browser handle it automatically
      ...(process.env.NODE_ENV !== 'production' && { domain: 'localhost' }),
    }

    // Store tokens in secure cookies
    if (tokenResponse.access_token) {
      setCookie(event, 'auth_access_token', tokenResponse.access_token, {
        ...tokenCookieOptions,
        maxAge: tokenResponse.expires_in || 86400, // Default to 24 hours
      })
    }

    if (tokenResponse.id_token) {
      setCookie(event, 'auth_id_token', tokenResponse.id_token, {
        ...tokenCookieOptions,
        maxAge: tokenResponse.expires_in || 86400, // Default to 24 hours
      })
    }

    if (tokenResponse.refresh_token) {
      setCookie(event, 'auth_refresh_token', tokenResponse.refresh_token, {
        ...tokenCookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    // Redirect to the original page or home with auth success flag
    const finalRedirect =
      redirectTo === '/'
        ? '/?auth=success'
        : `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}auth=success`

    await sendRedirect(event, finalRedirect)
  } catch (error) {
    console.error('Auth callback error:', error)

    // Clean up cookies on error
    deleteCookie(event, 'auth_state')
    deleteCookie(event, 'auth_code_verifier')
    deleteCookie(event, 'auth_redirect_to')

    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication callback error',
    })
  }
})
