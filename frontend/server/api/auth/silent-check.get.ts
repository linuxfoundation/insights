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
  const isProduction = process.env.NUXT_APP_ENV === 'production'

  try {
    // Check if we already have a valid token
    const oidcToken = getCookie(event, 'auth_oidc_token')
    if (oidcToken) {
      // Token exists, no need for silent login
      return {
        success: false,
        reason: 'token_exists',
        message: 'User already has a valid token',
      }
    }

    // Discover Auth0 configuration
    const authConfig = await discovery(
      new URL(`https://${config.public.auth0Domain}`),
      config.public.auth0ClientId,
    )

    // Generate state and code verifier for PKCE
    const state = randomState()
    const codeVerifier = randomPKCECodeVerifier()
    const codeChallenge = await calculatePKCECodeChallenge(codeVerifier)

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 10, // 10 minutes
      ...(!isProduction && { domain: 'localhost' }),
    }

    setCookie(event, 'auth_state', state, cookieOptions)
    setCookie(event, 'auth_code_verifier', codeVerifier, cookieOptions)

    const redirectTo = query.redirectTo as string
    if (redirectTo) {
      setCookie(event, 'auth_redirect_to', redirectTo, cookieOptions)
    }

    // Build authorization URL for silent authentication
    const redirectUri = config.public.auth0RedirectUri

    const authorizationUrl = buildAuthorizationUrl(authConfig, {
      scope: 'openid profile email',
      audience: config.public.auth0Audience,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: redirectUri,
      // Silent authentication parameters
      prompt: 'none', // This is key for silent auth - don't show login UI
      response_mode: 'query', // Use query parameters for response
    })

    // Return the authorization URL for client-side popup handling
    // Server-side approach won't work because we can't access Auth0 session cookies
    return {
      success: true,
      authorizationUrl: authorizationUrl.toString(),
      isSilent: true,
    }
  } catch (error) {
    console.error('Silent check error:', error)
    return {
      success: false,
      reason: 'error',
      message: 'Silent authentication check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
