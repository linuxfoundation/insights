// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface Leaderboard {
  rank: number;
  id: string;
  segmentId: string;
  name: string;
  slug: string;
  logoUrl: string;
  leaderboardType: string;
  value: number;
  previousPeriodValue: number;
}
