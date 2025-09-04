// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import PackageDependency from './package-dependency.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const packageDependency: WidgetConfig = {
  key: 'packageDependency',
  name: 'Package dependency',
  description: () => `Amount of packages, repositories, and Docker packages that rely on the 
    selected package(s) during the selected period. 
    <span class="font-semibold italic text-neutral-600">Data source: ecosyste.ms (<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC-BY-SA</a>)</span>`,
  learnMoreLink: `/docs/metrics/popularity#package-dependency`,
  component: PackageDependency,
  defaultValue: {
    package: 'all::All packages',
  },
  share: true,
  embed: true,
  snapshot: true,
};

export default packageDependency;
