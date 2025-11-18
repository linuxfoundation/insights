// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import DefaultCard from '../card-displays/default-card.vue';
import type { CommunityConfig } from './types/community.types';

export const stackoverflowConfig: CommunityConfig = {
  key: 'stackoverflow',
  label: 'Stack Overflow',
  image: '/images/platforms/stackoverflow.png',
  dataDisplay: DefaultCard,
};
