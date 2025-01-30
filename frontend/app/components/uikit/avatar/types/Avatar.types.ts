export const avatarSizes = ['xlarge', 'large', 'normal', 'small'] as const;
export const avatarShapes = ['circle', 'square'] as const;

export type AvatarSize = (typeof avatarSizes)[number];
export type AvatarShape = (typeof avatarShapes)[number];
