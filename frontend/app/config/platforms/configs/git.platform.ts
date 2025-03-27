import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import { ActivityTypes } from '~~/types/shared/activity-types';
import type { PlatformConfig } from '~~/types/shared/platforms.types';

export const git: PlatformConfig = {
  key: ActivityPlatforms.GIT.valueOf(),
  label: 'Git',
  image: '/images/integrations/git.png',
  activityTypes: [
    {
      key: ActivityTypes.AUTHORED_COMMIT.valueOf(),
      label: 'Authored a commit'
    },
    {
      key: ActivityTypes.REVIEWED_COMMIT.valueOf(),
      label: 'Reviewed a commit'
    },
    {
      key: ActivityTypes.TESTED_COMMIT.valueOf(),
      label: 'Tested a commit'
    },
    {
      key: ActivityTypes.COAUTHORED_COMMIT.valueOf(),
      label: 'Co-authored a commit'
    },
    {
      key: ActivityTypes.INFORMED_COMMIT.valueOf(),
      label: 'Informed a commit'
    },
    {
      key: ActivityTypes.INFLUENCED_COMMIT.valueOf(),
      label: 'Influenced a commit'
    },
    {
      key: ActivityTypes.APPROVED_COMMIT.valueOf(),
      label: 'Approved a commit'
    },
    {
      key: ActivityTypes.COMMITTED_COMMIT.valueOf(),
      label: 'Committed a commit'
    },
    {
      key: ActivityTypes.REPORTED_COMMIT.valueOf(),
      label: 'Reported a commit'
    },
    {
      key: ActivityTypes.RESOLVED_COMMIT.valueOf(),
      label: 'Resolved a commit'
    },
    {
      key: ActivityTypes.SIGNEDOFF_COMMIT.valueOf(),
      label: 'Signed off a commit'
    }
  ]
};
