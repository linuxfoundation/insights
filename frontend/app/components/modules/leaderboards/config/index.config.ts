// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { LeaderboardConfig } from './types/leaderboard.types';
import { mostActiveContributorsConfig } from './most-active-contributors.config';
import { mostActiveOrganizationsConfig } from './most-active-organizations.config';
import { longestRunningConfig } from './longest-running.config';
import { commitActivityConfig } from './commit-activity.config';
import { focusedTeamsConfig } from './focused-teams.config';
import { smallTeamsMassiveOutputConfig } from './small-teams-massive-output.config';

const leaderboardConfigs: LeaderboardConfig[] = [
  mostActiveContributorsConfig,
  mostActiveOrganizationsConfig,
  longestRunningConfig,
  commitActivityConfig,
  focusedTeamsConfig,
  smallTeamsMassiveOutputConfig,
];

export default leaderboardConfigs;
