// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const gitlab: PlatformConfig = {
  key: ActivityPlatforms.GITLAB,
  label: 'GitLab',
  image: '/images/integrations/gitlab.png',
  activityTypes: [
    {
      key: ActivityTypes.ISSUES_OPENED,
      label: 'Opened an issue'
    },
    {
      key: ActivityTypes.ISSUES_CLOSED,
      label: 'Closed an issue'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_CLOSED,
      label: 'Closed a merge request'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_OPENED,
      label: 'Opened a merge request'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_REVIEW_THREAD_COMMENT,
      label: 'Commented on a merge request review thread'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_MERGED,
      label: 'Merged a merge request'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_COMMENT,
      label: 'Commented on a merge request'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT,
      label: 'Commented on an issue'
    },
    {
      key: ActivityTypes.AUTHORED_COMMIT,
      label: 'Authored a commit'
    }
  ]
};
