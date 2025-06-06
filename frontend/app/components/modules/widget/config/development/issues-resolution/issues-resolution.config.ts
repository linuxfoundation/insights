// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import IssuesResolution from "./issues-resolution.vue";
import type {WidgetConfig} from "~/components/modules/widget/config/widget.config";

const issuesResolution: WidgetConfig = {
    key: 'issuesResolution',
    name: 'Issues resolution',
    description: () => 'Comparison between total number of issues vs. closed issues during the selected time period.',
    learnMoreLink: `/docs/metrics/development#issues-resolution`,
    component: IssuesResolution,
    share: true,
    embed: true,
    snapshot: true,
}

export default issuesResolution;
