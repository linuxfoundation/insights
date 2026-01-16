// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface LeaderboardBase {
  rank: number;
  id: string;
  segmentId: string;
  name: string;
  slug: string;
  logoUrl: string;
  leaderboardType: string;
  value: number;
  previousPeriodValue: number;
  collectionsSlugs: string[];
  githubHandle?: string;
  status: string;
}

export interface Leaderboard extends LeaderboardBase {
  isLF: boolean;
}
export interface LeaderboardTinybird extends LeaderboardBase {
  isLF: number;
}
