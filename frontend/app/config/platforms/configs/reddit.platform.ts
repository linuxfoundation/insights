// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const reddit: PlatformConfig = {
  key: ActivityPlatforms.REDDIT,
  label: 'Reddit',
  image: '/images/integrations/reddit.svg',
  activityTypes: [
    {
      key: ActivityTypes.POST,
      label: 'Posted a post'
    },
    {
      key: ActivityTypes.COMMENT,
      label: 'Commented on a post'
    }
  ]
};
