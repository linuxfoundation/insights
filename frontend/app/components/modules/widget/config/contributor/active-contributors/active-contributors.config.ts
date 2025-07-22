// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ActiveContributors from './active-contributors.vue';
import LfxShareActiveContributors from './share-active-contributors.vue';
import type {WidgetConfig} from '~/components/modules/widget/config/widget.config';
import {Granularity} from '~~/types/shared/granularity';
import {dateOptKeys} from "~/components/modules/project/config/date-options";

const activeContributors: WidgetConfig = {
    key: 'activeContributors',
    name: 'Active contributors',
    description: () => 'Active contributor is an individual who performed activities such as commits, issues,'
        + ' or pull requests during the selected time period.',
    learnMoreLink: `/docs/metrics/contributors#active-contributors`,
    component: ActiveContributors,
    defaultValue: {
        activeTab: Granularity.WEEKLY
    },
    share: true,
    embed: true,
    snapshot: true,
    additionalShare: LfxShareActiveContributors,
    benchmark: {
        title: 'Quarterly Active Contributors',
        showOnOverview: true,
        isVisible: (_, selectedTimeRangeKey) => selectedTimeRangeKey === dateOptKeys.previousQuarter,
        points: {
            0: {
                type: 'negative',
                description: '{value} active contributors in the last quarter',
                text: `Project activity is critically low, indicating significant 
                    maintenance and sustainability risks.`,
            },
            1: {
                type: 'negative',
                description: '{value} active contributors in the last quarter',
                text: `Project has very limited contributor activity, 
                    which may impact development pace and maintenance coverage.`,
            },
            2: {
                type: 'warning',
                description: '{value} active contributors in the last quarter',
                text: `Project maintains basic activity levels with a small contributor base, 
                    suggesting limited development capacity.`,
            },
            3: {
                type: 'warning',
                description: '{value} active contributors in the last quarter',
                text: `Project sustains moderate activity levels, 
                    though additional contributors could help ensure consistent maintenance.`,
            },
            4: {
                type: 'positive',
                description: '{value} active contributors in the last quarter',
                text: `Project maintains consistent activity with a 
                    stable contributor base driving regular development.`,
            },
            5: {
                type: 'positive',
                description: '{value} active contributors in the last quarter',
                text: `Project benefits from a large contributor base, ensuring 
                    continuous improvement and a vibrant development community`,
            }
        }
    }
};

export default activeContributors;
