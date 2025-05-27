// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ActiveContributors from './active-contributors.vue';
import LfxShareActiveContributors from './share-active-contributors.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';
import { Granularity } from '~~/types/shared/granularity';

const activeContributors: WidgetConfig = {
  key: 'activeContributors',
  name: 'Active contributors',
  description: () => 'Active contributor is an individual who performed activities such as commits, issues,'
    + ' or pull requests during the selected time period.',
  learnMoreLink: `/docs/metrics/contributors#active-contributors`,
  component: ActiveContributors,
  defaultValue: {
    activeTab: Granularity.WEEKLY
  },
  share: true,
  embed: false,
  snapshot: true,
  additionalShare: LfxShareActiveContributors
};

export default activeContributors;
