import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const jira: PlatformConfig = {
  key: ActivityPlatforms.JIRA.valueOf(),
  label: 'Jira',
  image: '/images/integrations/jira.png',
  activityTypes: [
    {
      key: ActivityTypes.ISSUE_CREATED.valueOf(),
      label: 'Created an issue'
    },
    {
      key: ActivityTypes.ISSUE_CLOSED.valueOf(),
      label: 'Closed an issue'
    },
    {
      key: ActivityTypes.ISSUE_ASSIGNED.valueOf(),
      label: 'Assigned an issue'
    },
    {
      key: ActivityTypes.ISSUE_UPDATED.valueOf(),
      label: 'Updated an issue'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT_CREATED.valueOf(),
      label: 'Created an issue comment'
    },
    {
      key: ActivityTypes.ISSUE_COMMENT_UPDATED.valueOf(),
      label: 'Updated an issue comment'
    },
    {
      key: ActivityTypes.ISSUE_ATTACHMENT_ADDED.valueOf(),
      label: 'Added an attachment to an issue'
    }
  ]
};
