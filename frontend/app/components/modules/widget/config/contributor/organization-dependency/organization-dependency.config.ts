// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import OrganizationsDependency from "./organization-dependency.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const organizationDependency: WidgetConfig = {
    key: 'organizationDependency',
    name: 'Organizations dependency',
    description: () => 'Distribution of contributions across different organizations, '
        + 'whose contributors were actively involved in the project during the selected period.',
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
