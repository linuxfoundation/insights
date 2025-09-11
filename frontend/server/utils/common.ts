// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const isLocal =
  process.env.NUXT_APP_ENV != 'staging' && process.env.NUXT_APP_ENV != 'production'
