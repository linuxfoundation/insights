import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const gerrit: PlatformConfig = {
  key: ActivityPlatforms.GERRIT.valueOf(),
  label: 'Gerrit',
  image: '/images/integrations/gerrit.png',
  activityTypes: [
    {
      key: ActivityTypes.CHANGESET_NEW.valueOf(),
      label: 'Created a changeset'
    },
    {
      key: ActivityTypes.CHANGESET_CREATED.valueOf(),
      label: 'Created a changeset'
    },
    {
      key: ActivityTypes.CHANGESET_MERGED.valueOf(),
      label: 'Merged a changeset'
    },
    {
      key: ActivityTypes.CHANGESET_CLOSED.valueOf(),
      label: 'Closed a changeset'
    },
    {
      key: ActivityTypes.CHANGESET_ABANDONED.valueOf(),
      label: 'Abandoned a changeset'
    },
    {
      key: ActivityTypes.CHANGESET_COMMENT_CREATED.valueOf(),
      label: 'Created a changeset comment'
    },
    {
      key: ActivityTypes.PATCHSET_CREATED.valueOf(),
      label: 'Created a patchset'
    },
    {
      key: ActivityTypes.PATCHSET_COMMENT_CREATED.valueOf(),
      label: 'Created a patchset comment'
    },
    {
      key: ActivityTypes.PATCHSET_APPROVAL_CREATED.valueOf(),
      label: 'Created a patchset approval'
    }
  ]
};
