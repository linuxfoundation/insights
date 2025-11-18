// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCommunityDefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';
import { jira } from '~/config/platforms/configs/jira.platform';

export const jiraCommunityConfig: CommunityConfig = {
  key: jira.key,
  platform: jira,
  dataDisplay: LfxCommunityDefaultCard,
};
