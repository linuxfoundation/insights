// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const benchmarkTypes = ['positive', 'warning', 'negative'] as const;

export type BenchmarkType = (typeof benchmarkTypes)[number];

