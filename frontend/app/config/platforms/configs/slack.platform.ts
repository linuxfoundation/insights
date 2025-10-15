// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms'
import type { PlatformConfig } from '~~/types/shared/platforms.types'

export const slack: PlatformConfig = {
  key: ActivityPlatforms.SLACK,
  label: 'Slack',
  image: '/images/integrations/slack.png',
}
