import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const git: PlatformConfig = {
  key: ActivityPlatforms.GIT,
  label: 'Git',
  image: '/images/integrations/git.png',
  activityTypes: [
    {
      key: ActivityTypes.AUTHORED_COMMIT,
      label: 'Authored a commit'
    },
    {
      key: ActivityTypes.REVIEWED_COMMIT,
      label: 'Reviewed a commit'
    },
    {
      key: ActivityTypes.TESTED_COMMIT,
      label: 'Tested a commit'
    },
    {
      key: ActivityTypes.COAUTHORED_COMMIT,
      label: 'Co-authored a commit'
    },
    {
      key: ActivityTypes.INFORMED_COMMIT,
      label: 'Informed a commit'
    },
    {
      key: ActivityTypes.INFLUENCED_COMMIT,
      label: 'Influenced a commit'
    },
    {
      key: ActivityTypes.APPROVED_COMMIT,
      label: 'Approved a commit'
    },
    {
      key: ActivityTypes.COMMITTED_COMMIT,
      label: 'Committed a commit'
    },
    {
      key: ActivityTypes.REPORTED_COMMIT,
      label: 'Reported a commit'
    },
    {
      key: ActivityTypes.RESOLVED_COMMIT,
      label: 'Resolved a commit'
    },
    {
      key: ActivityTypes.SIGNEDOFF_COMMIT,
      label: 'Signed off a commit'
    }
  ]
};
