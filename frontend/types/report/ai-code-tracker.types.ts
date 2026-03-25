// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface AiToolTimeSeriesDataPoint {
  startDate: string;
  endDate: string;
  toolKey: string;
  toolName: string;
  commitCount: number;
}

export interface PeriodTotalCommits {
  startDate: string;
  totalCommits: number;
}

export interface AiCodeTrackerResponse {
  data: AiToolTimeSeriesDataPoint[];
  periodTotals: PeriodTotalCommits[];
  projectCount: number;
}

export interface AiCodeTrackerQueryParams {
  granularity: string;
  startDate?: string | null;
  endDate?: string | null;
}
