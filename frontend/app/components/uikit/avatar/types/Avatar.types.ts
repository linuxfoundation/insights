export const avatarSizes = ['xlarge', 'large', 'normal', 'small', 'xsmall'] as const;
export const avatarTypes = ['user', 'organization'] as const;

export enum AvatarIcons {
  User = 'fa-solid fa-user',
  Organization = 'fa-solid fa-building'
}

export type AvatarSize = (typeof avatarSizes)[number];
export type AvatarType = (typeof avatarTypes)[number];
