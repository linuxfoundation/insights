import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const stackoverflow: PlatformConfig = {
  key: ActivityPlatforms.STACKOVERFLOW.valueOf(),
  label: 'Stack Overflow',
  image: '/images/integrations/stackoverflow.png',
  activityTypes: [
    {
      key: ActivityTypes.QUESTION.valueOf(),
      label: 'Asked a question'
    },
    {
      key: ActivityTypes.ANSWER.valueOf(),
      label: 'Answered a question'
    }
  ]
};
