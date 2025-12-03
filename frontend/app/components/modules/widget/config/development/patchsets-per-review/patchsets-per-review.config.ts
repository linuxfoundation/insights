// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import PatchsetsPerReview from './patchsets-per-review.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const patchsetsPerReview: WidgetConfig = {
  key: 'patchsetsPerReview',
  name: 'Patchsets per review',
  description: () => 'Patchsets required to complete a review during the selected period.',
  learnMoreLink: `/docs/metrics/development#patchsets-per-review`,
  component: PatchsetsPerReview,
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'code-commit',
    suggestions: 'How many patchsets per review?',
  },
};

export default patchsetsPerReview;
