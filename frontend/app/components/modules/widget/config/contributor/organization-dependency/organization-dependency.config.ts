// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import OrganizationsDependency from "./organization-dependency.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const organizationDependency: WidgetConfig = {
    key: 'organizationDependency',
    name: 'Organization dependency',
    description: () => 'Distribution of contributions across organizations, highlighting the group of '
        + 'organizations whose contributors performed 51%+ of all contributions in the selected time period.',
    learnMoreLink: `/docs/metrics/contributors#organizations-dependency`,
    component: OrganizationsDependency,
    defaultValue: {
        metric: 'all:all'
    },
    share: true,
    embed: true,
    snapshot: true,
    benchmark: {
        title: 'Organization Dependency',
        showOnOverview: true,
        isVisible: () => true,
        points: {
            0: {
                type: 'negative',
                description: '{value} organization accounts for 51%+ of contributions',
                text: `This project is highly dependent on a single organization, 
                indicating a lack of diverse organizational support.`,
              },
              1: {
                type: 'negative',
                description: '{value} organizations account for 51%+ of contributions',
                text: `This project mainly relies on only two organizations, 
                which suggests risk if one withdraws.`,
              },
              2: {
                type: 'warning',
                description: '{value} organizations account for 51%+ of contributions',
                text: `This project shows modest organizational diversity, 
                with a small number of organizations driving the majority of contributions.`,
              },
              3: {
                type: 'warning',
                description: '{value} organizations account for 51%+ of contributions',
                text: `This project has a moderate spread of contributions across several organizations.`,
              },
              4: {
                type: 'positive',
                description: '{value} organizations account for 51%+ of contributions',
                text: `This project benefits from strong organizational diversity, 
                with contributions well-distributed across many organizations.`,
              },
              5: {
                type: 'positive',
                description: '{value} organizations account for 51%+ of contributions',
                text: `This project benefits from excellent organizational diversity, 
                ensuring robust support and resilience through a wide range of contributing organizations.`,
              }
        }
    }
}

export default organizationDependency;
