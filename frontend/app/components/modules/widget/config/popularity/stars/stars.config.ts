// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import Stars from "./stars.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const stars: WidgetConfig = {
    key: 'stars',
    name: 'Stars',
    description: () => 'New stars added to the project repositories during the selected time period.',
    learnMoreLink: `/docs/metrics/popularity#stars`,
    component: Stars,
    defaultValue: {
        activeTab: 'new',
    },
    share: true,
    embed: true,
    snapshot: true,
}

export default stars;
