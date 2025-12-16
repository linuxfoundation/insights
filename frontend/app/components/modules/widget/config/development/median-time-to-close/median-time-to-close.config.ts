// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import MedianTimeToClose from './median-time-to-close.vue';
import MedianTimeToCloseFilters from './median-time-to-close-filters.vue';
import MedianTimeToCloseSnapshotHeader from './median-time-to-close-snapshot-header.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const medianTimeToClose: WidgetConfig = {
  key: 'medianTimeToClose',
  name: 'Median time to close',
  description: () => 'Median time taken for pull requests to be closed during the selected period.',
  learnMoreLink: `/docs/metrics/development#median-time-to-close`,
  component: MedianTimeToClose,
  defaultValue: (project) => {
    // Get first available platform from the allowed list
    const allowedPlatforms = ['github', 'gitlab', 'gerrit'];
    const platform = allowedPlatforms.find((p) => project.connectedPlatforms?.includes(p)) || '';
    return { platform };
  },
  share: true,
  embed: true,
  snapshot: true,
  headerFilters: MedianTimeToCloseFilters,
  snapshotHeaderComponent: MedianTimeToCloseSnapshotHeader,
  copilot: {
    icon: 'clock',
    suggestions: 'What is the median time to close?',
  },
};

export default medianTimeToClose;
