import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const confluence: PlatformConfig = {
  key: ActivityPlatforms.CONFLUENCE,
  label: 'Confluence',
  image: '/images/integrations/confluence.svg',
  activityTypes: [
    {
      key: ActivityTypes.PAGE_CREATED,
      label: 'Created a page'
    },
    {
      key: ActivityTypes.PAGE_UPDATED,
      label: 'Updated a page'
    },
    {
      key: ActivityTypes.COMMENT_CREATED,
      label: 'Created a comment'
    },
    {
      key: ActivityTypes.ATTACHMENT_CREATED,
      label: 'Created an attachment'
    },
    {
      key: ActivityTypes.BLOGPOST_CREATED,
      label: 'Created a blog post'
    },
    {
      key: ActivityTypes.BLOGPOST_UPDATED,
      label: 'Updated a blog post'
    },
    {
      key: ActivityTypes.ATTACHMENT,
      label: 'Attached a file'
    },
    {
      key: ActivityTypes.COMMENT,
      label: 'Commented on a page'
    }
  ]
};
