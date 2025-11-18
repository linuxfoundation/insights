// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { stackoverflow } from '~/config/platforms/configs/stackoverflow.platform';

export const stackoverflowCommunityConfig: CommunityConfig = {
  key: stackoverflow.key,
  platform: stackoverflow,
  dataDisplay: LfxCommunityDefaultCard,
};
