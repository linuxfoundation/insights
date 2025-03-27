import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const devto: PlatformConfig = {
  key: ActivityPlatforms.DEVTO.valueOf(),
  label: 'Dev.to',
  image: '/images/integrations/devto.png',
  activityTypes: [
    {
      key: ActivityTypes.COMMENT.valueOf(),
      label: 'Commented on a post'
    }
  ]
};
