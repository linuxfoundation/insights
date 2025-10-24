// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import CodeReviewEngagement from './code-review-engagement.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';
import { CodeReviewEngagementMetric } from '~~/types/development/requests.types';

const codeReviewEngagement: WidgetConfig = {
  key: 'codeReviewEngagement',
  name: 'Code review engagement',
  description: () =>
    'Level of contributors involvement and participation in code review activities during the' +
    ' selected period. Analyze trends to improve engagement.',
  learnMoreLink: `/docs/metrics/development#code-review-engagement`,
  component: CodeReviewEngagement,
  defaultValue: {
    activeTab: CodeReviewEngagementMetric.PR_PARTICIPANTS,
  },
  share: true,
  embed: true,
  snapshot: true,
  copilot: {
    icon: 'people-group',
    suggestions: 'Show me the code review engagement',
  },
};

export default codeReviewEngagement;
