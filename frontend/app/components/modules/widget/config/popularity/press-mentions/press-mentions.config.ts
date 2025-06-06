// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import PressMentions from "./press-mentions.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const pressMentions: WidgetConfig = {
    key: 'pressMentions',
    name: 'Press mentions',
    description: (project) => `Number of times that ${project.name} was mentioned in news and articles during`
        + ` the selected period.`,
    learnMoreLink: `/docs/metrics/popularity#press-mentions`,
    component: PressMentions,
    share: true,
    embed: true,
    snapshot: true,
}

export default pressMentions;
