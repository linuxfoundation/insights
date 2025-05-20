// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import SocialMentions from "./social-mentions.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const socialMentions: WidgetConfig = {
    key: 'socialMentions',
    name: 'Social mentions',
    description: (project) => `Number of times that ${project.name} was mentioned on social platforms during`
        + ` the selected period.`,
    learnMoreLink: `/docs/metrics/popularity#social-mentions`,
    component: SocialMentions,
    share: true,
    embed: false,
    snapshot: false,
}

export default socialMentions;
