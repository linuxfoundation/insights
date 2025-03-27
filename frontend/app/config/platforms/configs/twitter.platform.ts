import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const twitter: PlatformConfig = {
  key: ActivityPlatforms.TWITTER.valueOf(),
  label: 'X/Twitter',
  image: '/images/integrations/twitter.png',
  activityTypes: [
    {
      key: ActivityTypes.HASHTAG.valueOf(),
      label: 'Used a hashtag'
    },
    {
      key: ActivityTypes.MENTION.valueOf(),
      label: 'Mentioned a user'
    }
  ]
};
