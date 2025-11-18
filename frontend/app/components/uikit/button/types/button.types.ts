// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const buttonTypes = ['primary', 'secondary', 'tertiary', 'transparent', 'ghost'] as const;
export const buttonSizes = ['small', 'medium', 'large'] as const;
export const iconPosition = ['left', 'right'] as const;

export const buttonStyles = ['rounded', 'pill'] as const;

export type ButtonType = (typeof buttonTypes)[number];
export type ButtonSize = (typeof buttonSizes)[number];
export type IconPosition = (typeof iconPosition)[number];
export type ButtonStyle = (typeof buttonStyles)[number];
