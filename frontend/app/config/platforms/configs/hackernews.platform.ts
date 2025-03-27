import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const hackernews: PlatformConfig = {
  key: ActivityPlatforms.HACKERNEWS.valueOf(),
  label: 'Hacker News',
  image: '/images/integrations/hackernews.svg',
  activityTypes: [
    {
      key: ActivityTypes.POST.valueOf(),
      label: 'Posted a post'
    },
    {
      key: ActivityTypes.COMMENT.valueOf(),
      label: 'Commented on a post'
    }
  ]
};
