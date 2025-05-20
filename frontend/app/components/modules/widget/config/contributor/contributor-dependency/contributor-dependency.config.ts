// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import ContributorDependency from "./contributor-dependency.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const contributorDependency: WidgetConfig = {
    key: 'contributorDependency',
    name: 'Contributor dependency',
    description: () => 'Distribution of contributions among different contributors, highlighting key individuals '
        + 'who are actively involved in the project during the selected time period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/contributors#contributor-dependency`,
    component: ContributorDependency,
    share: true,
    embed: false,
    snapshot: false,
}

export default contributorDependency;
