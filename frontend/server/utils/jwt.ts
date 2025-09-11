// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

/**
 * Verifies JWT token from Authorization header
 * @param event - H3 event object
 * @returns Promise that resolves to decoded token or throws error
 */
export async function verifyJWT(event: H3Event): Promise<void> {
  // Read authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header required',
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'JWT secret not configured',
    })
  }

  try {
    jwt.verify(token, jwtSecret)
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid JWT token',
    })
  }
}

/**
 * Middleware to protect routes with JWT verification
 */
export function requireJWT() {
  return defineEventHandler(async (event) => {
    await verifyJWT(event)
  })
}

/**
 * Checks if a JWT token contains the required group claims for LFX Insights access
 * @param token - The JWT token string
 * @returns boolean - true if user has required permissions, false otherwise
 */
export const hasLfxInsightsPermission = (claims?: string[]): boolean => {
  const config = useRuntimeConfig()
  const appEnv = config.public.appEnv

  const isLocal = appEnv !== 'staging' && appEnv !== 'production'

  // In local we don't have SSO Groups so we should always allow to use the feature
  if (isLocal) {
    return true
  }

  if (!claims) {
    return false
  }

  return claims.includes(config.lfxAuth0TokenClaimGroupName)
}
