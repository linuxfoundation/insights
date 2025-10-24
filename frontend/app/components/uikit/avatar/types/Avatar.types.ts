// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const avatarSizes = ['xlarge', 'large', 'normal', 'small', 'xsmall'] as const;
export const avatarTypes = ['member', 'organization'] as const;

export enum AvatarIcons {
  Member = 'fa-solid fa-user',
  Organization = 'fa-solid fa-building',
}

export type AvatarSize = (typeof avatarSizes)[number];
export type AvatarType = (typeof avatarTypes)[number];
