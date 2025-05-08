// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface Summary {
  current: number;
  previous: number;
  percentageChange: number | undefined;
  changeValue: number;
  periodFrom: string;
  periodTo: string;
}

export interface Meta {
  offset: number;
  limit: number;
  total: number;
}
