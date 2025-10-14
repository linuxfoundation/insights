// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface User {
  sub: string
  name?: string
  email?: string
  picture?: string
  email_verified?: boolean
  updated_at?: string
  hasLfxInsightsPermission?: boolean
}

export interface AuthData {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  shouldAttemptSilentLogin?: boolean
}
