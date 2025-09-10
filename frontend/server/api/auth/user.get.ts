// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { getCookie, getHeader, getRequestURL } from 'h3'
import { jwtDecode, JwtPayload } from 'jwt-decode'

interface DecodedToken extends JwtPayload {
  sub: string
  name: string
  email: string
  picture: string
  email_verified: boolean
  updated_at: string
}
export default defineEventHandler(async (event) => {
  try {
    const idToken = getCookie(event, 'auth_id_token')
    const accessToken = getCookie(event, 'auth_access_token')

    // Debug logging for cookie reading
    console.log('Auth user endpoint debug:', {
      hasIdToken: !!idToken,
      hasAccessToken: !!accessToken,
      idTokenLength: idToken?.length || 0,
      accessTokenLength: accessToken?.length || 0,
      allCookies: getHeader(event, 'cookie') || '[NO COOKIES]',
      host: getHeader(event, 'host'),
      requestUrl: getRequestURL(event).toString(),
      isProduction: process.env.NODE_ENV === 'production',
    })

    if (!idToken || !accessToken) {
      console.log('Missing required tokens:', {
        missingIdToken: !idToken,
        missingAccessToken: !accessToken,
      })
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      }
    }

    // Decode the ID token to get user information
    const decodedToken = jwtDecode(idToken) as DecodedToken

    return {
      isAuthenticated: true,
      user: {
        sub: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
        email_verified: decodedToken.email_verified,
        updated_at: decodedToken.updated_at,
      },
      token: idToken,
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
