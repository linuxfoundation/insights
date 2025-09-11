// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { discovery, buildEndSessionUrl } from 'openid-client'
import { getCookie, deleteCookie } from 'h3'
import jwt from 'jsonwebtoken'
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Get the OIDC token for logout (don't delete yet - we need it for proper logout)
    const oidcToken = getCookie(event, 'auth_oidc_token')

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
          try {
            // Discover Auth0 configuration
            const authConfig = await discovery(
              new URL(`https://${config.public.auth0Domain}`),
              config.public.auth0ClientId,
            )

            // Build logout URL with original ID token
            const logoutUrl = buildEndSessionUrl(authConfig, {
              id_token_hint: originalIdToken,
              post_logout_redirect_uri: `${config.public.appUrl}?auth=logout`,
            })

            // Clear all auth cookies after successful logout URL generation
            deleteCookie(event, 'auth_oidc_token')
            deleteCookie(event, 'auth_refresh_token')
            deleteCookie(event, 'auth_state')
            deleteCookie(event, 'auth_code_verifier')
            deleteCookie(event, 'auth_redirect_to')

            return {
              success: true,
              logoutUrl: logoutUrl.toString(),
            }
          } catch (discoveryError) {
            console.error(
              'OIDC discovery not supported by auth provider, using manual logout URL for:',
              discoveryError,
            )

            // Fallback: Construct logout URL manually for Auth0/SSO
            // For production SSO or when discovery fails, use a manual logout URL
            const isProduction = process.env.NUXT_APP_ENV === 'production'
            let logoutUrl: string

            // Strictly check the hostname using the URL API
            let parsedAuth0Domain: URL
            try {
              parsedAuth0Domain = new URL(
                config.public.auth0Domain.startsWith('http')
                  ? config.public.auth0Domain
                  : `https://${config.public.auth0Domain}`,
              )
            } catch {
              parsedAuth0Domain = { hostname: '' } as URL // fallback in case parsing fails
            }

            if (isProduction && parsedAuth0Domain.hostname === 'sso.linuxfoundation.org') {
              // For Linux Foundation SSO, use their logout endpoint with ID token hint
              const logoutParams = new URLSearchParams({
                returnTo: `${config.public.appUrl}?auth=logout`,
                client_id: config.public.auth0ClientId,
              })

              // Add ID token hint if available for proper SSO logout
              if (originalIdToken) {
                logoutParams.set('id_token_hint', originalIdToken)
              }

              logoutUrl = `https://sso.linuxfoundation.org/v2/logout?${logoutParams.toString()}`
            } else {
              // For standard Auth0 domains, use the standard logout endpoint
              const auth0Domain = config.public.auth0Domain.replace('https://', '')
              const logoutParams = new URLSearchParams({
                returnTo: `${config.public.appUrl}?auth=logout`,
                client_id: config.public.auth0ClientId,
              })

              // Add ID token hint if available
              if (originalIdToken) {
                logoutParams.set('id_token_hint', originalIdToken)
              }

              logoutUrl = `https://${auth0Domain}/v2/logout?${logoutParams.toString()}`
            }

            deleteCookie(event, 'auth_state')
            deleteCookie(event, 'auth_code_verifier')
            deleteCookie(event, 'auth_redirect_to')
            deleteCookie(event, 'auth_oidc_token')
            deleteCookie(event, 'auth_refresh_token')

            return {
              success: true,
              logoutUrl,
            }
          }
        }
      } catch (tokenError) {
        console.error('Error decoding OIDC token for logout:', tokenError)
        // Continue with fallback logout
      }
    }

    // Clear all auth cookies for fallback case
    deleteCookie(event, 'auth_oidc_token')
    deleteCookie(event, 'auth_refresh_token')
    deleteCookie(event, 'auth_state')
    deleteCookie(event, 'auth_code_verifier')
    deleteCookie(event, 'auth_redirect_to')

    return {
      success: true,
      logoutUrl: `${config.public.appUrl}?auth=logout`,
    }
  } catch (error) {
    console.error('Auth logout error:', error)

    // Still clear cookies even if logout URL generation fails
    deleteCookie(event, 'auth_oidc_token')
    deleteCookie(event, 'auth_refresh_token')

    return {
      success: true,
      logoutUrl: `${config.public.appUrl}?auth=logout`,
    }
  }
})
