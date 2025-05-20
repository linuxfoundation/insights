// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";
import MergeLeadTime from "./merge-lead-time.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const config = useRuntimeConfig()

const mergeLeadTime: WidgetConfig = {
    key: 'mergeLeadTime',
    name: 'Merge lead time',
    description: () => 'Average time taken for pull requests to be raised, reviewed, '
        + 'accepted, and merged in the selected period.',
    learnMoreLink: `${config.public.appUrl}/docs/metrics/development#merge-lead-time`,
    component: MergeLeadTime,
    share: true,
    embed: false,
    snapshot: false,
}

export default mergeLeadTime;
