// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ContributionsOutsideWorkHours from './contributions-outside-work-hours.vue';
import LfxWidgetFilterCollaboration from '~/components/modules/widget/components/shared/filter/filter-collaboration.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const contributionsOutsideWorkHours: WidgetConfig = {
  key: 'contributionsOutsideWorkHours',
  availableInCollection: true,
  name: 'Contribution Time Distribution',
  description: () =>
    'Contributors’ activity patterns across the day and week during the selected period.',
  learnMoreLink: `/docs/metrics/development#contributions-outside-work-hours`,
  component: ContributionsOutsideWorkHours,
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'people-group',
    suggestions: 'Show me the contributions outside work hours',
  },
  headerFilters: LfxWidgetFilterCollaboration,
};

export default contributionsOutsideWorkHours;
