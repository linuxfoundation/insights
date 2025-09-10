// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { discovery, authorizationCodeGrant } from 'openid-client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const isProduction = process.env.NUXT_APP_ENV === 'production'

  try {
    // Get stored state and code verifier
    const storedState = query.state as string
    const codeVerifier = getCookie(event, 'auth_code_verifier')
    const redirectTo = getCookie(event, 'auth_redirect_to') || '/'

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
      secure: isProduction,
      // Use 'none' for production to ensure cross-site compatibility with Auth0 redirects
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      // Force domain for production to ensure cookies work across proxy inconsistencies
      ...(isProduction ? { domain: '.linuxfoundation.org' } : { domain: 'localhost' }),
    }

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
