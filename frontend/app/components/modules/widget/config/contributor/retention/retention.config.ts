// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import Retention from "./retention.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const retention: WidgetConfig = {
    key: 'retention',
    name: 'Retention',
    description: () => 'Rate at which contributors and organizations continued contributing to '
                 + 'the project during the selected period.',
    learnMoreLink: `/docs/metrics/contributors#retention`,
    defaultValue: {
        activeTab: 'contributors',
    },
    component: Retention,
    share: true,
    embed: false,
    snapshot: true,
}

export default retention;
