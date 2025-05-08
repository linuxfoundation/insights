// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const jira: PlatformConfig = {
  key: ActivityPlatforms.JIRA,
  label: 'Jira',
  image: '/images/integrations/jira.png',
  activityTypes: [
    {
      key: ActivityTypes.ISSUE_CREATED,
      label: 'Created an issue'
    },
    {
      key: ActivityTypes.ISSUE_CLOSED,
      label: 'Closed an issue'
    },
    {
      key: ActivityTypes.ISSUE_ASSIGNED,
      label: 'Assigned an issue'
    },
    {
      key: ActivityTypes.ISSUE_UPDATED,
      label: 'Updated an issue'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT_CREATED,
      label: 'Created an issue comment'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT_UPDATED,
      label: 'Updated an issue comment'
    },
    {
      key: ActivityTypes.ISSUE_ATTACHMENT_ADDED,
      label: 'Added an attachment to an issue'
    }
  ]
};
