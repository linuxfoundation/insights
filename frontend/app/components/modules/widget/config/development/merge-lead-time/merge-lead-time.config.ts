// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import MergeLeadTime from "./merge-lead-time.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const mergeLeadTime: WidgetConfig = {
    key: 'mergeLeadTime',
    name: 'Merge lead time',
    description: () => 'Average time taken for pull requests to be raised, reviewed, '
        + 'accepted, and merged in the selected period.',
    learnMoreLink: `/docs/metrics/development#merge-lead-time`,
    component: MergeLeadTime,
    share: true,
    embed: true,
    snapshot: true,
}

export default mergeLeadTime;
