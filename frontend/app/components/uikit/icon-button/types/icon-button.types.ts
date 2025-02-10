export const iconButtonTypes = ['default', 'transparent'] as const;
export const iconButtonSizes = ['small', 'medium', 'large'] as const;

export type IconButtonType = (typeof iconButtonTypes)[number];
export type IconButtonSize = (typeof iconButtonSizes)[number];
