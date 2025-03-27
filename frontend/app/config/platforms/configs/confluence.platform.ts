import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const confluence: PlatformConfig = {
  key: ActivityPlatforms.CONFLUENCE.valueOf(),
  label: 'Confluence',
  image: '/images/integrations/confluence.svg',
  activityTypes: [
    {
      key: ActivityTypes.PAGE_CREATED.valueOf(),
      label: 'Created a page'
    },
    {
      key: ActivityTypes.PAGE_UPDATED.valueOf(),
      label: 'Updated a page'
    },
    {
      key: ActivityTypes.COMMENT_CREATED.valueOf(),
      label: 'Created a comment'
    },
    {
      key: ActivityTypes.ATTACHMENT_CREATED.valueOf(),
      label: 'Created an attachment'
    },
    {
      key: ActivityTypes.BLOGPOST_CREATED.valueOf(),
      label: 'Created a blog post'
    },
    {
      key: ActivityTypes.BLOGPOST_UPDATED.valueOf(),
      label: 'Updated a blog post'
    },
    {
      key: ActivityTypes.ATTACHMENT.valueOf(),
      label: 'Attached a file'
    },
    {
      key: ActivityTypes.COMMENT.valueOf(),
      label: 'Commented on a page'
    }
  ]
};
