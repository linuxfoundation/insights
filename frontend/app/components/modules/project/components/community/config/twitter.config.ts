// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { twitter } from '~/config/platforms/configs/twitter.platform';

export const twitterCommunityConfig: CommunityConfig = {
  key: twitter.key,
  platform: twitter,
  dataDisplay: LfxCommunityDefaultCard,
};
