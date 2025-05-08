// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const progressBarTypes = ['normal', 'positive', 'warning', 'negative'] as const;

export type ProgressBarType = (typeof progressBarTypes)[number];
