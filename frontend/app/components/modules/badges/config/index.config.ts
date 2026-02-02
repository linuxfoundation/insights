// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { BadgeConfig, BadgeTier, ProjectBadge } from './badge.types';
import { getBadgeTierFromPercentile, BADGE_TIER_THRESHOLDS } from './badge.types';
import { starsBadgeConfig } from './stars.config';
import { forksBadgeConfig } from './forks.config';
import { commitActivityBadgeConfig } from './commit-activity.config';
import { codebaseSizeBadgeConfig } from './codebase-size.config';
import { fastestRespondersBadgeConfig } from './fastest-responders.config';
import { fastestMergersBadgeConfig } from './fastest-mergers.config';
import { resolutionRateBadgeConfig } from './resolution-rate.config';
import { activeContributorsBadgeConfig } from './active-contributors.config';
import { activeOrganizationsBadgeConfig } from './active-organizations.config';
import { focusedTeamsBadgeConfig } from './focused-teams.config';
import { smallTeamsMassiveOutputBadgeConfig } from './small-teams-massive-output.config';
import { packageDownloadsBadgeConfig } from './package-downloads.config';

export type { BadgeConfig, BadgeTier, ProjectBadge };
export { getBadgeTierFromPercentile, BADGE_TIER_THRESHOLDS };

const badgeConfigs: BadgeConfig[] = [
  starsBadgeConfig,
  forksBadgeConfig,
  commitActivityBadgeConfig,
  codebaseSizeBadgeConfig,
  fastestRespondersBadgeConfig,
  fastestMergersBadgeConfig,
  resolutionRateBadgeConfig,
  activeContributorsBadgeConfig,
  activeOrganizationsBadgeConfig,
  focusedTeamsBadgeConfig,
  smallTeamsMassiveOutputBadgeConfig,
  packageDownloadsBadgeConfig,
];

export default badgeConfigs;
