// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import MedianTimeToClose from './median-time-to-close.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const medianTimeToClose: WidgetConfig = {
  key: 'medianTimeToClose',
  name: 'Median time to close',
  description: () => 'Median time taken for pull requests to be closed during the selected period.',
  learnMoreLink: `/docs/metrics/development#median-time-to-close`,
  component: MedianTimeToClose,
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'clock',
    suggestions: 'What is the median time to close?',
  },
};

export default medianTimeToClose;
