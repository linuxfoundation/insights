// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ContributorDependency from "./contributor-dependency.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const contributorDependency: WidgetConfig = {
    key: 'contributorDependency',
    name: 'Contributor dependency',
    description: () => 'Distribution of contributions across individuals, highlighting the group of '
        + 'individual who are responsible for 51%+ of all contributions in the selected time period.',
    learnMoreLink: `/docs/metrics/contributors#contributor-dependency`,
    component: ContributorDependency,
    defaultValue: {
        metric: 'all:all',
        includeCollaborations: false,
    },
    share: true,
    embed: true,
    snapshot: true,
    benchmark: {
        title: 'Contributor Dependency',
        showOnOverview: true,
        isVisible: () => true,
        points: {
            0: {
              type: 'negative',
              description: '{value} contributor accounts for 51%+ of contributions',
              text: `This project is dependent on a single contributor, 
              leading to a high risk if that individual becomes unavailable.`
            },
            1: {
              type: 'negative',
              description: '{value} contributors account for 51%+ of contributions',
              text: `This project relies on only two contributors, 
              leading to an increased risk if those individuals become unavailable.`,
            },
            2: {
              type: 'warning',
              description: '{value} contributors account for 51%+ of contributions',
              text: `This project has low contributor diversity, 
              with a small group driving the majority of contributions.`,
            },
            3: {
              type: 'warning',
              description: '{value} contributors account for 51%+ of contributions',
              text: `This project has a moderate spread of contributions across several individuals.`,
            },
            4: {
              type: 'positive',
              description: '{value} contributors account for 51%+ of contributions',
              text: `This project benefits from strong contributor diversity, 
              with responsibilities well-distributed among a broader group of individuals.`,
            },
            5: {
              type: 'positive',
              description: '{value} contributors account for 51%+ of contributions',
              text: `This project benefits from excellent contributor diversity, 
              ensuring robust support and a highly resilient development process.`,
            }
        }
    },
    showCollabToggle: true,
}

export default contributorDependency;
