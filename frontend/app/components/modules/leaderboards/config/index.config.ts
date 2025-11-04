// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { LeaderboardConfig } from './types/leaderboard.types';
import { mostActiveContributorsConfig } from './most-active-contributors.config';
import { mostActiveOrganizationsConfig } from './most-active-organizations.config';

const leaderboardConfigs: LeaderboardConfig[] = [
  mostActiveContributorsConfig,
  mostActiveOrganizationsConfig,
];

export default leaderboardConfigs;
