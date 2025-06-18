// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import Retention from './retention.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const retention: WidgetConfig = {
  key: 'retention',
  name: 'Quarterly contributor retention',
  description: () => 'Share of contributors and organizations that contributed continuously '
    + 'in all consecutive quarters of the selected time period.',
  learnMoreLink: `/docs/metrics/contributors#retention`,
  defaultValue: {
    activeTab: 'contributors',
  },
  component: Retention,
  share: true,
  embed: true,
  snapshot: true,
};

export default retention;
