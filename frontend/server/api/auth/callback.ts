// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { discovery, authorizationCodeGrant } from 'openid-client'
import jwt from 'jsonwebtoken'
import { jwtDecode } from 'jwt-decode'
import { hasLfxInsightsPermission } from '../../utils/jwt'
import { GROUP_CLAIM_KEY, type DecodedIdToken } from '~~/types/auth/auth-jwt.types'
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

    // Validate client secret
    if (!config.auth0ClientSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Auth0 client secret not configured',
      })
    }

    // Validate and decode the ID token to extract user information
    if (!tokenResponse.id_token) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No ID token received from Auth0',
      })
    }

    const decodedIdToken = jwtDecode(tokenResponse.id_token) as DecodedIdToken

    const claims = decodedIdToken[GROUP_CLAIM_KEY]

    // Create custom OpenID Connect token payload
    const oidcTokenPayload = {
      sub: decodedIdToken.sub,
      name: decodedIdToken.name,
      email: decodedIdToken.email,
      picture: decodedIdToken.picture,
      email_verified: decodedIdToken.email_verified,
      updated_at: decodedIdToken.updated_at,
      iss: config.public.auth0Domain,
      aud: config.public.auth0ClientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (tokenResponse.expires_in || 86400),
      claims,
      hasLfxInsightsPermission: hasLfxInsightsPermission(claims),
      // Include original tokens for reference if needed
      // original_access_token: tokenResponse.access_token,
      original_id_token: tokenResponse.id_token,
    }

    // Sign the custom OpenID Connect token with client secret
    const oidcToken = jwt.sign(oidcTokenPayload, config.auth0ClientSecret, {
      algorithm: 'HS256',
    })

    // Define consistent cookie options for the OIDC token
    const tokenCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      // Use 'none' for production to ensure cross-site compatibility with Auth0 redirects
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      // Force domain for production to ensure cookies work across proxy inconsistencies
      ...(isProduction ? { domain: '.linuxfoundation.org' } : { domain: 'localhost' }),
      maxAge: tokenResponse.expires_in || 86400, // Default to 24 hours
    }

    // Store the single OpenID Connect token
    setCookie(event, 'auth_oidc_token', oidcToken, tokenCookieOptions)

    // Store refresh token separately if available
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
    deleteCookie(event, 'auth_oidc_token')
    deleteCookie(event, 'auth_refresh_token')

    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication callback error',
    })
  }
})
