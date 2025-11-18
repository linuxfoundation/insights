// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { slack } from '~/config/platforms/configs/slack.platform';

export const slackCommunityConfig: CommunityConfig = {
  key: slack.key,
  platform: slack,
  dataDisplay: LfxCommunityDefaultCard,
};
