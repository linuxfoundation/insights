// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ReviewEfficiency from './review-efficiency.vue';
import ReviewEfficiencyFilters from './review-efficiency-filters.vue';
import ReviewEfficiencySnapshotHeader from './review-efficiency-snapshot-header.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const reviewEfficiency: WidgetConfig = {
  key: 'reviewEfficiency',
  name: 'Review efficiency',
  description: () =>
    'Closed-to-opened pull requests ratio and activity trend during the selected period.',
  learnMoreLink: `/docs/metrics/development#review-efficiency`,
  component: ReviewEfficiency,
  defaultValue: (project) => {
    // Get first available platform from the allowed list
    const allowedPlatforms = ['github', 'gitlab', 'gerrit'];
    // Normalize platform names by removing -nango suffix
    const normalizedPlatforms = (project.connectedPlatforms || []).map((p) =>
      p.replace('-nango', ''),
    );
    const platform = allowedPlatforms.find((p) => normalizedPlatforms.includes(p)) || '';
    return { platform };
  },
  share: true,
  embed: true,
  snapshot: true,
  headerFilters: ReviewEfficiencyFilters,
  snapshotHeaderComponent: ReviewEfficiencySnapshotHeader,
  copilot: {
    icon: 'code-pull-request',
    suggestions: 'What is the review efficiency?',
  },
};

export default reviewEfficiency;
