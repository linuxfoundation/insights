// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const tagStyles = [
  'default',
  'neutral',
  'info',
  'positive',
  'warning',
  'negative',
  'positive-solid',
  'warning-solid',
  'negative-solid'
] as const;
export const tagSizes = ['small', 'medium'] as const;
export const tagTypes = ['solid', 'transparent', 'outline'] as const;

export type TagStyle = (typeof tagStyles)[number];
export type TagSize = (typeof tagSizes)[number];
export type TagType = (typeof tagTypes)[number];
