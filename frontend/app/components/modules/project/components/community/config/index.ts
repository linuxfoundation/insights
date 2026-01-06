// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { CommunityConfig } from './types/community.types';
import { blueskyConfig } from './bluesky.config';
import { devtoConfig } from './devto.config';
import { githubConfig } from './github.config';
import { hackernewsConfig } from './hackernews.config';
import { linkedinConfig } from './linkedin.config';
import { newsletterConfig } from './newsletter.config';
import { podcastConfig } from './podcast.config';
import { redditConfig } from './reddit.config';
import { stackoverflowConfig } from './stackoverflow.config';
import { xConfig } from './x.config';
import { youtubeConfig } from './youtube.config';

export const communityConfigs: Record<string, CommunityConfig> = {
  linkedin: linkedinConfig,
  stackoverflow: stackoverflowConfig,
  github: githubConfig,
  dev: devtoConfig,
  reddit: redditConfig,
  hackernews: hackernewsConfig,
  twitter: xConfig,
  youtube: youtubeConfig,
  newsletter: newsletterConfig,
  bluesky: blueskyConfig,
  podcasts: podcastConfig,
};

export default communityConfigs;
