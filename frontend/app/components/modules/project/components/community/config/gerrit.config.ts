// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { gerrit } from '~/config/platforms/configs/gerrit.platform';

export const gerritCommunityConfig: CommunityConfig = {
  key: gerrit.key,
  platform: gerrit,
  dataDisplay: LfxCommunityDefaultCard,
};
