// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import PatchsetsPerReview from './patchsets-per-review.vue';
import PatchsetsPerReviewFilters from './patchsets-per-review-filters.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const patchsetsPerReview: WidgetConfig = {
  key: 'patchsetPerReview',
  name: 'Patchsets per review',
  description: () => 'Patchsets required to complete a review during the selected period.',
  learnMoreLink: `/docs/metrics/development#patchsets-per-review`,
  component: PatchsetsPerReview,
  defaultValue: {
    platform: 'gerrit',
    granularity: 'monthly',
    dataType: 'median',
  },
  share: true,
  embed: true,
  snapshot: true,
  headerFilters: PatchsetsPerReviewFilters,
  copilot: {
    icon: 'code-commit',
    suggestions: 'How many patchsets per review?',
  },
};

export default patchsetsPerReview;
