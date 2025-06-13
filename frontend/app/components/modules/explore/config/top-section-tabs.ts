// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ExploreTab } from '../types/explore.types';
import LfxExploreTopProjects from '../components/top-projects.vue';
import LfxExploreTopContributors from '../components/top-contributors.vue';
import LfxExploreTopOrganizations from '../components/top-organizations.vue';

export const TOP_SECTION_TABS: ExploreTab[] = [
  {
    title: 'Top projects',
    description: `Projects ranked by Criticality Score — a metric that reflects their 
    importance, usage, and potential impact across the ecosystem.`,
    component: LfxExploreTopProjects,
    icon: 'laptop-code',
    type: 'project',
  },
  {
    title: 'Top active contributors',
    description: `Developers ranked by volume of contributions over the last 10 years, 
    highlighting the most active and influential individuals in the open source ecosystem.`,
    component: LfxExploreTopContributors,
    icon: 'people-group',
    type: 'contributor',
  },
  {
    title: 'Top active organizations',
    description: `Most influential organizations based on the total number of contributions 
    made across the most relevant open source projects over the last 10 years.`,
    component: LfxExploreTopOrganizations,
    icon: 'buildings',
    type: 'organization',
  },
];
