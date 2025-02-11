export const iconTypes = ['light', 'regular', 'solid', 'duotone'] as const;
export type IconType = (typeof iconTypes)[number];
