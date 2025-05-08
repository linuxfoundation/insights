// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ContributorDependency from "./contributor-dependency.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const contributorDependency: WidgetConfig = {
    key: 'contributorDependency',
    name: 'Contributor dependency',
    description: () => 'Distribution of contributions among different contributors, highlighting key individuals '
        + 'who are actively involved in the project during the selected time period.',
    learnMoreLink: 'https://docs.linuxfoundation.org/lfx/insights',
    component: ContributorDependency,
    share: true,
    embed: false,
    snapshot: false,
}

export default contributorDependency;
