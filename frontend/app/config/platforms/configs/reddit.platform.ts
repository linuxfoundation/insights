import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const reddit: PlatformConfig = {
  key: ActivityPlatforms.REDDIT.valueOf(),
  label: 'Reddit',
  image: '/images/integrations/reddit.svg',
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
