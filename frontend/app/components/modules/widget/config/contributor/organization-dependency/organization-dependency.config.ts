// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxWidgetFilterCollaboration from '~/components/modules/widget/components/shared/filter/filter-collaboration.vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

import OrganizationsDependency from './organization-dependency.vue';

const organizationDependency: WidgetConfig = {
  key: 'organizationDependency',
  availableInCollection: true,
  name: 'Company dependency',
  description: () =>
    'Distribution of contributions across companies, highlighting the group of ' +
    'companies whose contributors performed 51%+ of all contributions in the selected time period.',
  learnMoreLink: `/docs/metrics/contributors#company-dependency`,
  component: OrganizationsDependency,
  defaultValue: {
    metric: 'all:all',
    includeCollaborations: false,
  },
  share: true,
  embed: true,
  snapshot: true,
  benchmark: {
    title: 'Company Dependency',
    showOnOverview: true,
    isVisible: () => true,
    points: {
      0: {
        type: 'negative',
        description: '{value} company accounts for 51%+ of contributions',
        text: `This project is highly dependent on a single company, 
                indicating a lack of diverse company support.`,
      },
      1: {
        type: 'negative',
        description: '{value} companies account for 51%+ of contributions',
        text: `This project mainly relies on only two companies, 
                which suggests risk if one withdraws.`,
      },
      2: {
        type: 'warning',
        description: '{value} companies account for 51%+ of contributions',
        text: `This project shows modest company diversity, 
                with a small number of companies driving the majority of contributions.`,
      },
      3: {
        type: 'warning',
        description: '{value} companies account for 51%+ of contributions',
        text: `This project has a moderate spread of contributions across several companies.`,
      },
      4: {
        type: 'positive',
        description: '{value} companies account for 51%+ of contributions',
        text: `This project benefits from strong company diversity, 
                with contributions well-distributed across many companies.`,
      },
      5: {
        type: 'positive',
        description: '{value} companies account for 51%+ of contributions',
        text: `This project benefits from excellent company diversity, 
                ensuring robust support and resilience through a wide range of contributing companies.`,
      },
    },
  },
  copilot: {
    icon: 'people-group',
    suggestions: 'Show me the company dependency',
  },
  headerFilters: LfxWidgetFilterCollaboration,
};

export default organizationDependency;
