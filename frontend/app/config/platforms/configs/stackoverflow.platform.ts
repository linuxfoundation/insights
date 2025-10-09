// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms'
import { ActivityTypes } from '~~/types/shared/activity-types'
import type { PlatformConfig } from '~~/types/shared/platforms.types'

export const stackoverflow: PlatformConfig = {
  key: ActivityPlatforms.STACKOVERFLOW,
  label: 'Stack Overflow',
  image: '/images/integrations/stackoverflow.png',
  activityTypes: [
    {
      key: ActivityTypes.QUESTION,
      label: 'Asked a question',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.ANSWER,
      label: 'Answered a question',
      isCollaborationType: true,
    },
  ],
}
