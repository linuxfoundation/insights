// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms'
import { ActivityTypes } from '~~/types/shared/activity-types'
import type { PlatformConfig } from '~~/types/shared/platforms.types'

export const confluence: PlatformConfig = {
  key: ActivityPlatforms.CONFLUENCE,
  label: 'Confluence',
  image: '/images/integrations/confluence.svg',
  activityTypes: [
    {
      key: ActivityTypes.PAGE_CREATED,
      label: 'Created a page',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.PAGE_UPDATED,
      label: 'Updated a page',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.COMMENT_CREATED,
      label: 'Created a comment',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.ATTACHMENT_CREATED,
      label: 'Created an attachment',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.BLOGPOST_CREATED,
      label: 'Created a blog post',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.BLOGPOST_UPDATED,
      label: 'Updated a blog post',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.ATTACHMENT,
      label: 'Attached a file',
      isCollaborationType: true,
    },
    {
      key: ActivityTypes.COMMENT,
      label: 'Commented on a page',
      isCollaborationType: true,
    },
  ],
}
