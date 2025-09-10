// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import {
  discovery,
  randomState,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  buildAuthorizationUrl,
} from 'openid-client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  try {
    // Discover Auth0 configuration
    const authConfig = await discovery(
      new URL(`https://${config.public.auth0Domain}`),
      config.public.auth0ClientId,
    )

    // Generate state and code verifier for PKCE
    const state = randomState()
    const codeVerifier = randomPKCECodeVerifier()
    const codeChallenge = await calculatePKCECodeChallenge(codeVerifier)

    // Store state and code verifier in secure cookies
    console.log('Setting auth cookies:', {
      state: state.substring(0, 8) + '...',
      codeVerifier: codeVerifier.substring(0, 8) + '...',
      isProduction: process.env.NODE_ENV === 'production',
      requestUrl: getRequestURL(event).toString(),
      host: getHeader(event, 'host'),
      userAgent: getHeader(event, 'user-agent'),
    })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 10, // 10 minutes
      // Don't set domain for production - let browser handle it automatically
      // This ensures cookies work with the actual domain (insights.linuxfoundation.org)
      ...(process.env.NODE_ENV !== 'production' && { domain: 'localhost' }),
    }

    setCookie(event, 'auth_state', state, cookieOptions)
    setCookie(event, 'auth_code_verifier', codeVerifier, cookieOptions)

    // Store redirect URL if provided
    const redirectTo = query.redirectTo as string
    if (redirectTo) {
      setCookie(event, 'auth_redirect_to', redirectTo, cookieOptions)
    }

    // Build authorization URL
    const redirectUri = config.public.auth0RedirectUri

    const authorizationUrl = buildAuthorizationUrl(authConfig, {
      scope: 'openid profile email',
      audience: config.public.auth0Audience,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: redirectUri,
    })

    // Return the authorization URL for client-side redirect
    const userAgent = getHeader(event, 'user-agent') || ''
    const acceptHeader = getHeader(event, 'accept') || ''

    // If this is a browser request (not API call), redirect directly
    if (userAgent.includes('Mozilla') && acceptHeader.includes('text/html')) {
      await sendRedirect(event, authorizationUrl.toString())
    } else {
      // If this is an API call, return JSON
      return {
        success: true,
        authorizationUrl: authorizationUrl.toString(),
      }
    }
  } catch (error) {
    console.error('Auth login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication error',
    })
  }
})
