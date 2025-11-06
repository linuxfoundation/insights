// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { LeaderboardConfig } from './types/leaderboard.types';
import { mostActiveContributorsConfig } from './most-active-contributors.config';
import { mostActiveOrganizationsConfig } from './most-active-organizations.config';
import { longestRunningConfig } from './longest-running.config';
import { commitActivityConfig } from './commit-activity.config';
import { focusedTeamsConfig } from './focused-teams.config';
import { smallTeamsMassiveOutputConfig } from './small-teams-massive-output.config';
import { codebaseSizeConfig } from './codebase-size.config';
import { fastestRespondersConfig } from './fastest-responders.config';
import { fastestMergersConfig } from './fastest-mergers.config';
import { resolutionRateConfig } from './resolution-rate.config';
// import { top100ProjectsConfig } from './top-100-projects.config';
// import { top100ContributorsConfig } from './top-100-contributors.config';
// import { top100OrganizationsConfig } from './top-100-organizations.config';

const leaderboardConfigs: LeaderboardConfig[] = [
  // top100ProjectsConfig,
  // top100ContributorsConfig,
  // top100OrganizationsConfig,
  mostActiveContributorsConfig,
  mostActiveOrganizationsConfig,
  commitActivityConfig,
  longestRunningConfig,
  codebaseSizeConfig,
  fastestRespondersConfig,
  fastestMergersConfig,
  focusedTeamsConfig,
  resolutionRateConfig,
  smallTeamsMassiveOutputConfig,
];

export default leaderboardConfigs;
