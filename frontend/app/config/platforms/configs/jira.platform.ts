// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms'
import type { PlatformConfig } from '~~/types/shared/platforms.types'

export const jira: PlatformConfig = {
  key: ActivityPlatforms.JIRA,
  label: 'Jira',
  image: '/images/integrations/jira.png',
}
