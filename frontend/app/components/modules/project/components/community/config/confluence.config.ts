// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { confluence } from '~/config/platforms/configs/confluence.platform';

export const confluenceCommunityConfig: CommunityConfig = {
  key: confluence.key,
  platform: confluence,
  dataDisplay: LfxCommunityDefaultCard,
};
