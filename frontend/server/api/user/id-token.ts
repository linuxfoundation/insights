// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { getUserSession } from 'nuxt-oidc-auth/runtime/server/utils/session.js'

// interface OidcSession {
//   loggedIn: boolean
//   idToken?: string
//   user?: {
//     sub?: string
//     email?: string
//     name?: string
//     picture?: string
//   }
// }

export default defineEventHandler(async (event) => {
  try {
    // Get the user session using nuxt-oidc-auth's server utility
    const session = await getUserSession(event)

    // Check if user is authenticated
    if (!session || !session.loggedInAt) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated',
      })
    }

    // Check if idToken is available
    // if (!session.idToken) {
    //   throw createError({
    //     statusCode: 404,
    //     statusMessage:
    //       'ID token not available. Make sure exposeIdToken is enabled in OIDC configuration.',
    //   })
    // }

    // Return the ID token and available session info
    return {
      idToken: session.idToken,
      loggedInAt: session.loggedInAt,
      // Include any additional user info that might be in the session
      sessionInfo: Object.keys(session).filter((key) => !['idToken', 'loggedInAt'].includes(key)),
    }
  } catch (error: unknown) {
    console.error('Error fetching ID token:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching ID token',
    })
  }
})
