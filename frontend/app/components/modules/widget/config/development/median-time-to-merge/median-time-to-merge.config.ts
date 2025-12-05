// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import MedianTimeToMerge from './median-time-to-merge.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const medianTimeToMerge: WidgetConfig = {
  key: 'medianTimeToMerge',
  name: 'Median time to merge',
  description: () => 'Median time taken for pull requests to be merged during the selected period.',
  learnMoreLink: `/docs/metrics/development#median-time-to-merge`,
  component: MedianTimeToMerge,
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'clock',
    suggestions: 'What is the median time to merge?',
  },
};

export default medianTimeToMerge;
