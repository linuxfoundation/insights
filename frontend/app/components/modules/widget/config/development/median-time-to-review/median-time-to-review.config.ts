// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import MedianTimeToReview from './median-time-to-review.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const medianTimeToReview: WidgetConfig = {
  key: 'medianTimeToReview',
  name: 'Median time to review',
  description: () =>
    'Median time taken between change submission and its first review during the selected period.',
  learnMoreLink: `/docs/metrics/development#median-time-to-review`,
  component: MedianTimeToReview,
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'clock',
    suggestions: 'What is the median time to review?',
  },
};

export default medianTimeToReview;
