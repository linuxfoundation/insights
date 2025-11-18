// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { hackernews } from '~/config/platforms/configs/hackernews.platform';

export const hackernewsCommunityConfig: CommunityConfig = {
  key: hackernews.key,
  platform: hackernews,
  dataDisplay: LfxCommunityDefaultCard,
};
