// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import CommitActivities from './commit-activities.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const config = useRuntimeConfig()

const commitActivities: WidgetConfig = {
  key: 'commitActivities',
  name: 'Commit Activities',
  description: () => 'Number of commits performed during the selected period.',
  learnMoreLink: `${config.public.appUrl}/docs/metrics/development#commit-activities`,
  component: CommitActivities,
  share: true,
  embed: false,
  snapshot: false
};

export default commitActivities;
