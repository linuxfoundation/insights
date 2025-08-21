// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { decodeJwt } from 'jose'
import { useRuntimeConfig } from 'nuxt/app';

const isLocal = (): boolean => {
  const config = useRuntimeConfig()
  const appEnv = config.public.appEnv

  return appEnv !== 'staging' && appEnv !== 'production'
}

const GROUP_CLAIM_KEY = 'https://sso.linuxfoundation.org/claims/groups'
const GROUP_NAME = 'lfproducts-lfx-insights'

/**
 * Checks if a JWT token contains the required group claims for LFX Insights access
 * @param token - The JWT token string
 * @returns boolean - true if user has required permissions, false otherwise
 */
export const hasLfxInsightsPermission = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false
  }

  // In local we don't have SSO Groups so we should always allow to use the feature
  if (isLocal()) {
    return true
  }

  try {
    // decodeJwt does NOT verify the signature, it just decodes the payload
    const payload = decodeJwt(token)
    
    // Check if the payload contains the group claim
    if (!payload[GROUP_CLAIM_KEY]) {
      return false
    }
    
    const groups = payload[GROUP_CLAIM_KEY] as string[]
    
    // Check if groups is an array and contains the required group
    if (!Array.isArray(groups)) {
      return false
    }
    
    return groups.includes(GROUP_NAME)
  } catch (error) {
    // If token is malformed or decoding fails, return false
    console.warn('Failed to decode JWT token:', error)
    return false
  }
}