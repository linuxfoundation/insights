import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const linkedin: PlatformConfig = {
  key: ActivityPlatforms.LINKEDIN,
  label: 'LinkedIn',
  image: '/images/integrations/linkedin.png',
  activityTypes: [
    {
      key: ActivityTypes.COMMENT,
      label: 'Commented on a post'
    }
  ]
};
