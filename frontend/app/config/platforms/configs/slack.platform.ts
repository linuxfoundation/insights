import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const slack: PlatformConfig = {
  key: ActivityPlatforms.SLACK,
  label: 'Slack',
  image: '/images/integrations/slack.png',
  activityTypes: [
    {
      key: ActivityTypes.MESSAGE,
      label: 'Sent a message'
    }
  ]
};
