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

    // Instead of returning URL for client-side handling, we'll use a different approach
    // We'll make a server-side request to check if the user has an active session
    // by attempting the silent auth flow server-side with proper cookie forwarding

    try {
      // Make a server-side request to Auth0 with proper headers to simulate browser request
      const authResponse = await fetch(authorizationUrl.toString(), {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects automatically
        headers: {
          'User-Agent': getHeader(event, 'user-agent') || 'Mozilla/5.0 (compatible; LFX-Insights)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          // Forward any relevant cookies from the original request
          Cookie: getHeader(event, 'cookie') || '',
        },
      })

      // Check if we got a redirect response
      if (authResponse.status === 302 || authResponse.status === 301) {
        const location = authResponse.headers.get('location')

        if (location) {
          // If redirected to our callback URL, it means user is authenticated
          if (location.includes(config.public.auth0RedirectUri)) {
            // Parse the callback URL to get the authorization code
            const callbackUrl = new URL(location)
            const code = callbackUrl.searchParams.get('code')
            const returnedState = callbackUrl.searchParams.get('state')

            if (code && returnedState === state) {
              // Exchange the authorization code for tokens
              const tokenResponse = await fetch(
                `https://${config.public.auth0Domain}/oauth/token`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: config.public.auth0ClientId,
                    client_secret: config.auth0ClientSecret,
                    code,
                    redirect_uri: redirectUri,
                    code_verifier: codeVerifier,
                  }),
                },
              )

              if (tokenResponse.ok) {
                const tokens = await tokenResponse.json()

                // Set the authentication cookie
                const tokenCookieOptions = {
                  httpOnly: true,
                  secure: isProduction,
                  sameSite: 'lax' as const,
                  path: '/',
                  maxAge: 60 * 60 * 24 * 7, // 7 days
                  domain: isProduction ? config.auth0CookieDomain : 'localhost',
                }

                setCookie(event, 'auth_oidc_token', tokens.id_token, tokenCookieOptions)

                // Clean up temporary cookies
                deleteCookie(event, 'auth_state', { path: '/' })
                deleteCookie(event, 'auth_code_verifier', { path: '/' })

                return {
                  success: true,
                  reason: 'silent_login_successful',
                  message: 'User was silently authenticated',
                }
              }
            }
          } else if (location.includes('error=')) {
            // Auth0 returned an error (likely user not logged in)
            const errorUrl = new URL(location)
            const error = errorUrl.searchParams.get('error')
            const errorDescription = errorUrl.searchParams.get('error_description')

            return {
              success: false,
              reason: 'auth_error',
              message: `Authentication failed: ${error} - ${errorDescription}`,
            }
          }
        }
      }

      // If we reach here, silent authentication failed (user not logged in to SSO)
      return {
        success: false,
        reason: 'not_authenticated',
        message: 'User is not authenticated with SSO provider',
      }
    } catch (fetchError) {
      console.error('Silent authentication fetch error:', fetchError)
      return {
        success: false,
        reason: 'fetch_error',
        message: 'Failed to check authentication status',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      }
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
