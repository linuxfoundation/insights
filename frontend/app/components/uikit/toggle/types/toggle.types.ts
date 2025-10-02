// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const toggleSizes = ['small', 'medium', 'large'] as const
export type ToggleSize = (typeof toggleSizes)[number]
