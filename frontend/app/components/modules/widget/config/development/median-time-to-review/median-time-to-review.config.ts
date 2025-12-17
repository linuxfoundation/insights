// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import MedianTimeToReview from './median-time-to-review.vue';
import MedianTimeToReviewFilters from './median-time-to-review-filters.vue';
import MedianTimeToReviewSnapshotHeader from './median-time-to-review-snapshot-header.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const medianTimeToReview: WidgetConfig = {
  key: 'medianTimeToReview',
  name: 'Median time to review',
  description: () =>
    'Median time taken between change submission and its first review during the selected period.',
  learnMoreLink: `/docs/metrics/development#median-time-to-review`,
  component: MedianTimeToReview,
  defaultValue: (project) => {
    // Get first available platform from the allowed list
    const allowedPlatforms = ['github', 'gitlab', 'gerrit'];
    const platform = allowedPlatforms.find((p) => project.connectedPlatforms?.includes(p)) || '';
    return { platform };
  },
  share: true,
  embed: true,
  snapshot: true,
  headerFilters: MedianTimeToReviewFilters,
  snapshotHeaderComponent: MedianTimeToReviewSnapshotHeader,
  copilot: {
    icon: 'clock',
    suggestions: 'What is the median time to review?',
  },
};

export default medianTimeToReview;
