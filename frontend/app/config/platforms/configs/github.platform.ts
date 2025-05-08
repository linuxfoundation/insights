// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const github: PlatformConfig = {
  key: ActivityPlatforms.GITHUB,
  label: 'GitHub',
  image: '/images/integrations/github.png',
  activityTypes: [
    {
      key: ActivityTypes.AUTHORED_COMMIT,
      label: 'Authored a commit'
    },
    {
      key: ActivityTypes.PULL_REQUEST_CLOSED,
      label: 'Closed a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_OPENED,
      label: 'Opened a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_COMMENT,
      label: 'Commented on a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_MERGED,
      label: 'Merged a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_REVIEW_REQUESTED,
      label: 'Requested a review for a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
      label: 'Commented on a pull request review thread'
    },
    {
      key: ActivityTypes.ISSUE_CLOSED,
      label: 'Closed an issue'
    },
    {
      key: ActivityTypes.ISSUE_OPENED,
      label: 'Opened an issue'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT,
      label: 'Commented on an issue'
    },

    {
      key: ActivityTypes.DISCUSSION_STARTED,
      label: 'Started a discussion'
    },
    {
      key: ActivityTypes.DISCUSSION_COMMENT,
      label: 'Commented on a discussion'
    }
  ]
};
