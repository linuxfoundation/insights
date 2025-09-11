// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { discovery, buildEndSessionUrl } from 'openid-client'
import { getCookie, deleteCookie } from 'h3'
import jwt from 'jsonwebtoken'
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Get the OIDC token for logout
    const oidcToken = getCookie(event, 'auth_oidc_token')

    // Clear all auth cookies
    deleteCookie(event, 'auth_oidc_token')
    deleteCookie(event, 'auth_refresh_token')

    // If we have an OIDC token, extract the original ID token for proper Auth0 logout
    if (oidcToken && config.auth0ClientSecret) {
      try {
        // Verify and decode the OIDC token to get the original ID token
        const decodedToken = jwt.verify(oidcToken, config.auth0ClientSecret, {
          algorithms: ['HS256'],
        }) as DecodedOidcToken

        // Use the original ID token for Auth0 logout if available
        const originalIdToken = decodedToken.original_id_token

        if (originalIdToken) {
          // Discover Auth0 configuration
          const authConfig = await discovery(
            new URL(`https://${config.public.auth0Domain}`),
            config.public.auth0ClientId,
          )

          // Build logout URL with original ID token
          const logoutUrl = buildEndSessionUrl(authConfig, {
            id_token_hint: originalIdToken,
            post_logout_redirect_uri: config.public.appUrl,
          })

          return {
            success: true,
            logoutUrl: logoutUrl.toString(),
          }
        }
      } catch (tokenError) {
        console.error('Error decoding OIDC token for logout:', tokenError)
        // Continue with fallback logout
      }
    }

    return {
      success: true,
      logoutUrl: config.public.appUrl,
    }
  } catch (error) {
    console.error('Auth logout error:', error)

    // Still clear cookies even if logout URL generation fails
    deleteCookie(event, 'auth_oidc_token')
    deleteCookie(event, 'auth_refresh_token')

    return {
      success: true,
      logoutUrl: config.public.appUrl,
    }
  }
})
