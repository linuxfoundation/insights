// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const oidcToken = getCookie(event, 'auth_oidc_token')

    if (!oidcToken) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      }
    }

    // Validate client secret
    if (!config.auth0ClientSecret) {
      console.error('Auth0 client secret not configured')
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      }
    }

    // Verify and decode the OIDC token using the client secret
    const decodedToken = jwt.verify(oidcToken, config.auth0ClientSecret, {
      algorithms: ['HS256'],
    }) as DecodedOidcToken

    return {
      isAuthenticated: true,
      user: {
        sub: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
        email_verified: decodedToken.email_verified,
        updated_at: decodedToken.updated_at,
        hasLfxInsightsPermission: decodedToken.hasLfxInsightsPermission,
      },
      token: decodedToken.original_id_token,
    }
  } catch (error) {
    console.error('Auth user error:', error)
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    }
  }
})
