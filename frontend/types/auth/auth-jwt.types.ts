// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { JwtPayload } from 'jsonwebtoken'

export const GROUP_CLAIM_KEY = 'https://sso.linuxfoundation.org/claims/groups'
export const CLAIM_GROUP_NAME = 'lfproducts-lfx-insights'
export interface DecodedOidcToken {
  sub: string
  name?: string
  email?: string
  picture?: string
  email_verified?: boolean
  updated_at?: string
  iss: string
  aud: string
  iat: number
  exp: number
  original_id_token?: string
  hasLfxInsightsPermission?: boolean
}

export interface DecodedIdToken extends JwtPayload {
  sub: string
  name?: string
  email?: string
  picture?: string
  email_verified?: boolean
  updated_at?: string
  [GROUP_CLAIM_KEY]?: string[]
}
