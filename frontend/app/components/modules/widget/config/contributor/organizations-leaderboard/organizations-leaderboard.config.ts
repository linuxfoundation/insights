// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxWidgetFilterCollaboration from '~/components/modules/widget/components/shared/filter/filter-collaboration.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

import OrganizationsLeaderboard from './organizations-leaderboard.vue';

const organizationsLeaderboard: WidgetConfig = {
  key: 'organizationsLeaderboard',
  availableInCollection: true,
  name: 'Companies leaderboard',
  description: () =>
    'Companies ranked by the number of contribution activities' +
    ' performed by contributors on their behalf during the selected time period.',
  learnMoreLink: `/docs/metrics/contributors#companies-leaderboard`,
  component: OrganizationsLeaderboard,
  defaultValue: {
    metric: 'all:all',
    includeCollaborations: false,
  },
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'people-group',
    suggestions: 'How many companies are there in the leaderboard?',
  },
  headerFilters: LfxWidgetFilterCollaboration,
};

export default organizationsLeaderboard;
