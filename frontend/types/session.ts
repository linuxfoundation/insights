// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface OidcSession {
  loggedInAt: number
  idToken?: string
  user?: {
    sub?: string
    email?: string
    name?: string
    picture?: string
  }
  sessionInfo?: string[]
}
