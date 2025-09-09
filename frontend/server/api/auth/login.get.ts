// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import {
  discovery,
  randomState,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  buildAuthorizationUrl,
} from 'openid-client'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  try {
    console.log('!!!config:', config.public)
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
    setCookie(event, 'auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    })

    setCookie(event, 'auth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    })

    // Store redirect URL if provided
    const redirectTo = query.redirectTo as string
    if (redirectTo) {
      setCookie(event, 'auth_redirect_to', redirectTo, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10, // 10 minutes
      })
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
