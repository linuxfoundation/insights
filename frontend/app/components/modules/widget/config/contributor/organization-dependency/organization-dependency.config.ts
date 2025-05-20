// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import OrganizationsDependency from "./organization-dependency.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const organizationDependency: WidgetConfig = {
    key: 'organizationDependency',
    name: 'Organizations dependency',
    description: () => 'Distribution of contributions across different organizations, '
        + 'whose contributors were actively involved in the project during the selected period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/contributors#organizations-dependency`,
    component: OrganizationsDependency,
    share: true,
    embed: false,
    snapshot: false,
}

export default organizationDependency;
