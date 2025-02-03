export const tooltipPlacements = ['bottom', 'top', 'left', 'right'] as const;

export type TooltipPlacement = (typeof tooltipPlacements)[number];
