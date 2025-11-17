// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Component } from 'vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

export interface LeaderboardConfig {
  key: string;
  name: string;
  description: string;
  icon: string;
  dataDisplay: Component;
  columnLabel: string;
  columnTooltip?: string;
  seoTitle: string;
  seoDescription: string;
}

export interface LeaderboardLandingResponse {
  data: Leaderboard[];
  page: number;
  pageSize: number;
}
