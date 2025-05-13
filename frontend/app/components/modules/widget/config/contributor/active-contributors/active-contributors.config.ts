// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import ActiveContributors from "./active-contributors.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const activeContributors: WidgetConfig = {
    key: 'activeContributors',
    name: 'Active contributors',
    description: () => 'Active contributor is an individual who performed activities such as commits, issues,'
        + ' or pull requests during the selected time period.',
    learnMoreLink: 'https://insights.linuxfoundation.org/docs/metrics/contributors.html#active-contributors',
    component: ActiveContributors,
    share: true,
    embed: false,
    snapshot: false,
}

export default activeContributors;
