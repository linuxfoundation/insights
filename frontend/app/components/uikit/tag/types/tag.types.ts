export const tagStyles = ['default', 'info', 'positive', 'warning', 'negative'] as const;
export const tagSizes = ['small', 'medium'] as const;
export const tagTypes = ['solid', 'transparent', 'outline'] as const;

export type TagStyle = (typeof tagStyles)[number];
export type TagSize = (typeof tagSizes)[number];
export type TagType = (typeof tagTypes)[number];
