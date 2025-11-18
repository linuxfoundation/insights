// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { git } from '~/config/platforms/configs/git.platform';

export const gitCommunityConfig: CommunityConfig = {
  key: git.key,
  platform: git,
  dataDisplay: LfxCommunityDefaultCard,
};
