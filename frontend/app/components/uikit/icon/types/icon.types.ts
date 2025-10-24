// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const iconTypes = ['light', 'regular', 'solid', 'duotone', 'brands'] as const;
export type IconType = (typeof iconTypes)[number];
