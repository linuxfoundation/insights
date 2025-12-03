// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ReviewEfficiency from './review-efficiency.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const reviewEfficiency: WidgetConfig = {
  key: 'reviewEfficiency',
  name: 'Review efficiency',
  description: () =>
    'Closed-to-opened pull requests ratio and activity trend during the selected period.',
  learnMoreLink: `/docs/metrics/development#review-efficiency`,
  component: ReviewEfficiency,
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'code-pull-request',
    suggestions: 'What is the review efficiency?',
  },
};

export default reviewEfficiency;
