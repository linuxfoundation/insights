// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { github } from '~/config/platforms/configs/github.platform';

export const githubCommunityConfig: CommunityConfig = {
  key: github.key,
  platform: github,
  dataDisplay: LfxCommunityDefaultCard,
};
