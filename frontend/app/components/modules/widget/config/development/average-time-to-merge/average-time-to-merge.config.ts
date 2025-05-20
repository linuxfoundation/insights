// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import AverageTimeToMerge from "./average-time-to-merge.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const averateTimeToMerge: WidgetConfig = {
    key: 'averageTimeToMerge',
    name: 'Average time to merge',
    description: () => 'Average time taken for pull requests to be merged during the selected period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/development#average-time-to-merge`,
    component: AverageTimeToMerge,
    share: true,
    embed: false,
    snapshot: false,
}

export default averateTimeToMerge;
