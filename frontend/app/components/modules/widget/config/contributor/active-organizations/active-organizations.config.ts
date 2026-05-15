// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Granularity } from '@lfx-insights/types';
import ActiveOrganizations from './active-organizations.vue';
import LfxWidgetFilterCollaboration from '~/components/modules/widget/components/shared/filter/filter-collaboration.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const activeOrganizations: WidgetConfig = {
  key: 'activeOrganization',
  name: 'Active organizations',
  description: () =>
    'Organizations that had at least one active contributor during the selected period.',
  learnMoreLink: `/docs/metrics/contributors#active-organizations`,
  component: ActiveOrganizations,
  defaultValue: {
    activeTab: Granularity.WEEKLY,
    includeCollaborations: false,
  },
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'people-group',
    suggestions: 'How many active organizations are there?',
  },
  headerFilters: LfxWidgetFilterCollaboration,
};

export default activeOrganizations;
