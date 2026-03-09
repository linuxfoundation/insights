// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const radioSizes = ['small', 'default'] as const;
export type RadioSize = (typeof radioSizes)[number];
