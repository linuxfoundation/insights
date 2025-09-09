// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { discovery, buildEndSessionUrl } from 'openid-client'
import { getCookie, deleteCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Get the ID token for logout
    const idToken = getCookie(event, 'auth_id_token')

    // Clear all auth cookies
    deleteCookie(event, 'auth_access_token')
    deleteCookie(event, 'auth_id_token')
    deleteCookie(event, 'auth_refresh_token')

    // If we have an ID token, perform Auth0 logout
    if (idToken) {
      // Discover Auth0 configuration
      const authConfig = await discovery(
        new URL(`https://${config.public.auth0Domain}`),
        config.public.auth0ClientId,
      )

      // Build logout URL
      const logoutUrl = buildEndSessionUrl(authConfig, {
        id_token_hint: idToken,
        post_logout_redirect_uri: config.public.appUrl,
      })

      return {
        success: true,
        logoutUrl: logoutUrl.toString(),
      }
    }

    return {
      success: true,
      logoutUrl: config.public.appUrl,
    }
  } catch (error) {
    console.error('Auth logout error:', error)

    // Still clear cookies even if logout URL generation fails
    deleteCookie(event, 'auth_access_token')
    deleteCookie(event, 'auth_id_token')
    deleteCookie(event, 'auth_refresh_token')

    return {
      success: true,
      logoutUrl: config.public.appUrl,
    }
  }
})
