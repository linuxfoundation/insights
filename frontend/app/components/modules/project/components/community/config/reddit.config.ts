// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import RedditCard from '../card-displays/reddit-card.vue';
import type { CommunityConfig } from './types/community.types';

export const redditConfig: CommunityConfig = {
  key: 'reddit',
  label: 'Reddit',
  image: '/images/platforms/reddit.svg',
  dataDisplay: RedditCard,
};
