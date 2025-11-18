// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { reddit } from '~/config/platforms/configs/reddit.platform';

export const redditCommunityConfig: CommunityConfig = {
  key: reddit.key,
  platform: reddit,
  dataDisplay: LfxCommunityDefaultCard,
};
