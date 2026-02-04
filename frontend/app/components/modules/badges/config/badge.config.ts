// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig, type ProjectBadge } from '../types/badge.types';
import { getBadgeTierFromPercentile, tierConfigs } from './tiers.config';
import { starsBadgeConfig } from './badges/stars.config';
import { forksBadgeConfig } from './badges/forks.config';
import { commitActivityBadgeConfig } from './badges/commit-activity.config';
import { codebaseSizeBadgeConfig } from './badges/codebase-size.config';
import { fastestRespondersBadgeConfig } from './badges/fastest-responders.config';
import { fastestMergersBadgeConfig } from './badges/fastest-mergers.config';
import { activeContributorsBadgeConfig } from './badges/active-contributors.config';
import { activeOrganizationsBadgeConfig } from './badges/active-organizations.config';
import { packageDownloadsBadgeConfig } from './badges/package-downloads.config';

export { BadgeTier };
export type { BadgeConfig, ProjectBadge };
export { getBadgeTierFromPercentile, tierConfigs };

const badgeConfigs: BadgeConfig[] = [
  starsBadgeConfig,
  forksBadgeConfig,
  commitActivityBadgeConfig,
  codebaseSizeBadgeConfig,
  fastestRespondersBadgeConfig,
  fastestMergersBadgeConfig,
  activeContributorsBadgeConfig,
  activeOrganizationsBadgeConfig,
  packageDownloadsBadgeConfig,
];

export default badgeConfigs;
