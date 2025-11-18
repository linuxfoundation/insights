// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { discourse } from '~/config/platforms/configs/discourse.platform';

export const discourseCommunityConfig: CommunityConfig = {
  key: discourse.key,
  platform: discourse,
  dataDisplay: LfxCommunityDefaultCard,
};
