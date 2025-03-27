import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const gitlab: PlatformConfig = {
  key: ActivityPlatforms.GITLAB.valueOf(),
  label: 'GitLab',
  image: '/images/integrations/gitlab.png',
  activityTypes: [
    {
      key: ActivityTypes.ISSUE_OPENED.valueOf(),
      label: 'Opened an issue'
    },
    {
      key: ActivityTypes.ISSUE_CLOSED.valueOf(),
      label: 'Closed an issue'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_CLOSED.valueOf(),
      label: 'Closed a merge request'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_OPENED.valueOf(),
      label: 'Opened a merge request'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_REVIEW_THREAD_COMMENT.valueOf(),
      label: 'Commented on a merge request review thread'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_MERGED.valueOf(),
      label: 'Merged a merge request'
    },
    {
      key: ActivityTypes.MERGE_REQUEST_COMMENT.valueOf(),
      label: 'Commented on a merge request'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT.valueOf(),
      label: 'Commented on an issue'
    },
    {
      key: ActivityTypes.AUTHORED_COMMIT.valueOf(),
      label: 'Authored a commit'
    }
  ]
};
