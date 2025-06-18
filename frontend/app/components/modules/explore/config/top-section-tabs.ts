// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ExploreTab } from '../types/explore.types';
import LfxExploreTopProjects from '../components/top-projects.vue';
import LfxExploreTopContributors from '../components/top-contributors.vue';
import LfxExploreTopOrganizations from '../components/top-organizations.vue';

export const TOP_SECTION_TABS: ExploreTab[] = [
  {
    title: 'Top Linux Foundation projects',
    description: `Linux Foundation projects ranked by Criticality Score, considering 
    their importance, usage, and potential impact across the ecosystem.`,
    component: LfxExploreTopProjects,
    icon: 'laptop-code',
    type: 'project',
  },
  {
    title: 'Top contributors',
    description: `Contributors ranked by the number of contributions in ALL 
    projects tracked by Insights over the last 10 years.`,
    component: LfxExploreTopContributors,
    icon: 'people-group',
    type: 'contributor',
  },
  {
    title: 'Top organizations',
    description: `Organizations ranked by the number of affiliated contributions in 
    ALL projects tracked by Insights over the last 10 years.`,
    component: LfxExploreTopOrganizations,
    icon: 'buildings',
    type: 'organization',
  },
];
