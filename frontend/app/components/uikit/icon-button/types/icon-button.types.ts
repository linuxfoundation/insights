// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const iconButtonTypes = ['default', 'transparent', 'primary'] as const;
export const iconButtonSizes = ['small', 'medium', 'large'] as const;

export type IconButtonType = (typeof iconButtonTypes)[number];
export type IconButtonSize = (typeof iconButtonSizes)[number];
