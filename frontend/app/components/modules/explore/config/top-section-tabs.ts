// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxExploreTopProjects from '../components/top-projects.vue';
import type { ExploreTab } from '../types/explore.types';

export const TOP_SECTION_TABS: ExploreTab[] = [
  {
    title: 'Top Linux Foundation projects',
    description: `Linux Foundation projects ranked by the total number of contributors.`,
    component: LfxExploreTopProjects,
    icon: 'laptop-code',
    type: 'project',
  },
];
