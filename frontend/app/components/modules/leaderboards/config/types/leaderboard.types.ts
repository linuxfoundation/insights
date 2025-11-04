// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Component } from 'vue';

export interface LeaderboardConfig {
  key: string;
  name: string;
  icon: string;
  dataDisplay: Component;
  sort: string;
  columnLabel: string;
  columnTooltip?: string;
}
