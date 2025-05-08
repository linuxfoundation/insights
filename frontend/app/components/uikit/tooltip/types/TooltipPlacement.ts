// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const tooltipPlacements = ['bottom', 'top', 'left', 'right'] as const;

export type TooltipPlacement = (typeof tooltipPlacements)[number];
