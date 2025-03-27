import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const groupsio: PlatformConfig = {
  key: ActivityPlatforms.GROUPS_IO.valueOf(),
  label: 'Groups.io',
  image: '/images/integrations/groupsio.svg',
  activityTypes: [
    {
      key: ActivityTypes.MESSAGE.valueOf(),
      label: 'Sent a message'
    }
  ]
};
