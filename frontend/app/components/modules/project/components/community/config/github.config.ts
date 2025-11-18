// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import DefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';

export const githubConfig: CommunityConfig = {
  key: 'github',
  label: 'GitHub',
  image: '/images/platforms/github.png',
  dataDisplay: DefaultCard,
};
