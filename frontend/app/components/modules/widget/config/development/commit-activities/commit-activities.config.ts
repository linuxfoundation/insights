// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import CommitActivities from './commit-activities.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const commitActivities: WidgetConfig = {
  key: 'commitActivities',
  name: 'Commit Activities',
  description: () => 'Number of commits performed during the selected period.',
  learnMoreLink: `/docs/metrics/development#commit-activities`,
  component: CommitActivities,
  defaultValue: {
    activeTab: 'new',
  },
  share: true,
  embed: true,
  snapshot: true
};

export default commitActivities;
