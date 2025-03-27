import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const discourse: PlatformConfig = {
  key: ActivityPlatforms.DISCOURSE,
  label: 'Discourse',
  image: '/images/integrations/discourse.png',
  activityTypes: [
    {
      key: ActivityTypes.CREATE_TOPIC,
      label: 'Created a topic'
    },
    {
      key: ActivityTypes.MESSAGE_IN_TOPIC,
      label: 'Sent a message in a topic'
    }
  ]
};
