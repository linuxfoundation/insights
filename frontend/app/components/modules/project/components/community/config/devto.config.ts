// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { devto } from '~/config/platforms/configs/devto.platform';

export const devtoCommunityConfig: CommunityConfig = {
  key: devto.key,
  platform: devto,
  dataDisplay: LfxCommunityDefaultCard,
};
