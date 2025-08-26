// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import AverageTimeToMerge from "./average-time-to-merge.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const averateTimeToMerge: WidgetConfig = {
    key: 'averageTimeToMerge',
    name: 'Average time to merge',
    description: () => 'Average time taken for pull requests to be merged during the selected period.',
    learnMoreLink: `/docs/metrics/development#average-time-to-merge`,
    component: AverageTimeToMerge,
    share: true,
    embed: true,
    snapshot: true,
    copilot: {
        icon: 'people-group',
        suggestions: 'Show me the average time to merge'
      }
}

export default averateTimeToMerge;
