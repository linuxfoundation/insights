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
}

export default organizationDependency;
