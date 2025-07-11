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
        metric: 'all:all'
    },
    share: true,
    embed: true,
    snapshot: true,
}

export default contributorDependency;
