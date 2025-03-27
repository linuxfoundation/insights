import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const github: PlatformConfig = {
  key: ActivityPlatforms.GITHUB.valueOf(),
  label: 'GitHub',
  image: '/images/integrations/github.png',
  activityTypes: [
    {
      key: ActivityTypes.AUTHORED_COMMIT.valueOf(),
      label: 'Authored a commit'
    },
    {
      key: ActivityTypes.PULL_REQUEST_CLOSED.valueOf(),
      label: 'Closed a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_OPENED.valueOf(),
      label: 'Opened a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_COMMENT.valueOf(),
      label: 'Commented on a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_MERGED.valueOf(),
      label: 'Merged a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_REVIEW_REQUESTED.valueOf(),
      label: 'Requested a review for a pull request'
    },
    {
      key: ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT.valueOf(),
      label: 'Commented on a pull request review thread'
    },
    {
      key: ActivityTypes.ISSUE_CLOSED.valueOf(),
      label: 'Closed an issue'
    },
    {
      key: ActivityTypes.ISSUE_OPENED.valueOf(),
      label: 'Opened an issue'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT.valueOf(),
      label: 'Commented on an issue'
    },

    {
      key: ActivityTypes.DISCUSSION_STARTED.valueOf(),
      label: 'Started a discussion'
    },
    {
      key: ActivityTypes.DISCUSSION_COMMENT.valueOf(),
      label: 'Commented on a discussion'
    }
  ]
};
