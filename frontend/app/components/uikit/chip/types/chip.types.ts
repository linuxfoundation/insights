export const chipSizes = ['small', 'normal'] as const;
export const chipTypes = ['light', 'dark'] as const;
export type ChipSize = (typeof chipSizes)[number];
export type ChipType = (typeof chipTypes)[number];
