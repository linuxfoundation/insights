import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const discord: PlatformConfig = {
  key: ActivityPlatforms.DISCORD,
  label: 'Discord',
  image: '/images/integrations/discord.png',
  activityTypes: [
    {
      key: ActivityTypes.MESSAGE,
      label: 'Sent a message'
    },
    {
      key: ActivityTypes.THREAD_STARTED,
      label: 'Started a thread'
    },
    {
      key: ActivityTypes.THREAD_MESSAGE,
      label: 'Sent a message in a thread'
    }
  ]
};
