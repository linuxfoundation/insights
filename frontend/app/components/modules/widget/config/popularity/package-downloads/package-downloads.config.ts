// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import PackageDownloads from './package-downloads.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const packageDownloads: WidgetConfig = {
  key: 'packageDownloads',
  name: 'Package downloads',
  description: () => `Tracking of package downloads over time, providing insights into how widely 
    the project is adopted and integrated within other software. <i>(Note: We don't have data before June 2025.)</i>
    <span class="font-semibold italic text-neutral-600">Powered by Ecosyste.ms.</span>`,
  learnMoreLink: `/docs/metrics/popularity#package-downloads`,
  component: PackageDownloads,
  defaultValue: {
    package: 'all::All packages',
  },
  share: true,
  embed: true,
  snapshot: true,
};

export default packageDownloads;
