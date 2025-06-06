// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const twitter: PlatformConfig = {
  key: ActivityPlatforms.TWITTER,
  label: 'X/Twitter',
  image: '/images/integrations/x.png',
  activityTypes: [
    {
      key: ActivityTypes.HASHTAG,
      label: 'Used a hashtag'
    },
    {
      key: ActivityTypes.MENTION,
      label: 'Mentioned a user'
    }
  ]
};
