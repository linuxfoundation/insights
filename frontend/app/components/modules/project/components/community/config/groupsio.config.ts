// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { groupsio } from '~/config/platforms/configs/groupsio.platform';

export const groupsioCommunityConfig: CommunityConfig = {
  key: groupsio.key,
  platform: groupsio,
  dataDisplay: LfxCommunityDefaultCard,
};
