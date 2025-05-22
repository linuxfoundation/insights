// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import Forks from "./forks.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const forks: WidgetConfig = {
    key: 'forks',
    name: 'Forks',
    description: () => 'New forks (copies) of the project repositories during the selected time period.',
    learnMoreLink: `/docs/metrics/popularity#forks`,
    component: Forks,
    defaultValue: {
        activeTab: 'new',
    },
    share: true,
    embed: false,
    snapshot: true,
}

export default forks;
